# Troubleshooting

Common issues and solutions for DClaw Create.

## Quick Diagnostics

```bash
# Check app pods
kubectl get pods -n dclaw-create

# Check logs
kubectl logs -n dclaw-create deployment/dclaw-create-backend

# Check database
kubectl get clusters -n dclaw-create
```

## Sections

- [Common Issues](./common-issues)
- [FAQ](./faq)
