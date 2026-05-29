from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.generation_job_repo import GenerationJobRepository
from app.schemas.generation_job import (
    GenerationJobCreate,
    GenerationJobList,
    GenerationJobResponse,
)
from app.services import generation_service

router = APIRouter(prefix="/api/v1/generations", tags=["generations"])


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    return await generation_service.get_generation_stats(db)


@router.get("/", response_model=GenerationJobList)
async def list_jobs(
    job_type: str | None = Query(None),
    status: str | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    repo = GenerationJobRepository(db)

    if job_type:
        items = await repo.list_by_type(job_type, limit, offset)
    elif status:
        items = await repo.list_by_status(status, limit, offset)
    else:
        items, _ = await repo.list_all(limit, offset)

    total = await repo.count()
    return GenerationJobList(
        items=[GenerationJobResponse.model_validate(i) for i in items],
        total=total,
    )


@router.post("/", response_model=GenerationJobResponse, status_code=201)
async def create_job(
    data: GenerationJobCreate, db: AsyncSession = Depends(get_db),
):
    job = await generation_service.generate(
        job_type=data.job_type,
        prompt=data.prompt,
        db=db,
        provider_id=data.provider_id,
    )
    return GenerationJobResponse.model_validate(job)


@router.get("/{job_id}", response_model=GenerationJobResponse)
async def get_job(job_id: UUID, db: AsyncSession = Depends(get_db)):
    repo = GenerationJobRepository(db)
    job = await repo.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
