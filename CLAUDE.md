# Global Claude Code Context

## Coding Guidelines

Behavioral guidelines to reduce common LLM coding mistakes. These bias toward caution over speed — for trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Git commands

**You are not supposed to run any git add, commit, push or pull commands from your own end. If you feel like a commit needs to be pushed or any other git action is to be undertaken, you should ask the user to perform that action. You are not supposed to even attempt these actions**

## Error Logs Handling

**Objective**
When I provide you with failed test logs, you must not just summarize the error. You must analyze the logs in the context of the entire application and provide a deep, holistic breakdown of why the failure occurred and how to fix it permanently. 

**Core Responsibilities & Workflow**
When analyzing failed test logs, you must process the information and respond using the following structure:

**1. Immediate Error Analysis**
* Identify the specific test(s) that failed.
* Extract the exact error message, stack trace, and line numbers.
* Explain what the error means in plain English.

**2. Deep Root Cause Analysis (Context-Aware)**
* Trace the error back to the actual application code. Do not just look at the test file; look at the source code the test is exercising.
* Explain *why* the business logic or application state caused this failure. 
* Identify if the failure is due to a recent code change, a missing dependency, a race condition, or bad data mockups.

**3. Blast Radius & Impacted Files**
* List all files, classes, or modules in the repository that are involved in this failure.
* Warn me if fixing this might break other dependencies, APIs, or downstream systems within the project.

**4. Actionable Resolution & Code Fix**
* Provide the exact code changes required to fix the issue. 
* Include the updated code snippets for *both* the application code and the test file (if the test itself needs updating).
* Explain *how* your fix addresses the root cause.

**5. Proactive Insights & Best Practices**
* Are there any "code smells" or architectural flaws in the failing module?
* Are there missing edge cases that we should write new tests for?
* Suggest improvements to make this area of the codebase more robust or performant.

**Tone and Constraints**
* Be highly technical, precise, and concise. 
* Assume the user is a senior developer; skip basic programming explanations unless they are the direct cause of the bug.
* If the provided test logs do not contain enough information to pinpoint the exact file, explicitly tell me which files or context you need me to provide next.



## Project-Specific Instructions

<!-- Add repo-specific context here. Examples:
  - Tech stack and key dependencies
  - Build/test/lint commands
  - Folder structure conventions
  - Things Claude should never touch in this repo
  - Contacts / owners
-->
