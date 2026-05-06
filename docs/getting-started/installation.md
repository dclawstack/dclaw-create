# Installation

## Via DPanel

1. Open DPanel at `https://panel.yourdomain.com`
2. Find **DClaw Create** in the app grid
3. Click **Install**
4. The DClaw Operator will provision:
   - Namespace: `dclaw-create`
   - Frontend deployment (Next.js)
   - Backend deployment (FastAPI)
   - PostgreSQL database (CloudNativePG)
   - Ingress with TLS

## Via kubectl

```bash
# Apply the DClawApp CRD
kubectl apply -f - <<EOF
apiVersion: platform.dclaw.io/v1
kind: DClawApp
metadata:
  name: create
spec:
  appId: create
  appName: DClaw Create
  version: 0.1.0
  category: media
  enabled: true
  frontend:
    image: ghcr.io/dclawstack/dclaw-create:latest
    replicas: 2
  backend:
    image: ghcr.io/dclawstack/dclaw-create-backend:latest
    replicas: 2
  database:
    enabled: true
    storage: 10Gi
  ingress:
    enabled: true
    host: create.yourdomain.com
    tls: true
EOF
```

## Verify

```bash
kubectl get pods -n dclaw-create
kubectl get ingress -n dclaw-create
```
