---
name: k8s
description: Deploy, manage, and troubleshoot Kubernetes workloads. Use for manifest review, Helm chart validation, resource tuning, RBAC, and cluster operations.
metadata:
  category: user-invoked
disable-model-invocation: true
---

Default output: return only the result, blockers, and required evidence. Omit preambles, process narration, repeated context, confidence scores, and follow-up offers. Use at most five bullets unless a required artifact or schema needs more.

# Kubernetes Operations

## Current Versions (Verify Before Use)

```bash
kubectl version --client          # kubectl version
kubectl version                   # client + server versions
helm version                      # Helm version
```

Check [Kubernetes releases](https://kubernetes.io/releases/) for the latest stable and [Helm releases](https://github.com/helm/helm/releases).

## Core Principles

1. **Declarative over imperative.** Use YAML manifests and `kubectl apply`. Avoid `kubectl run`, `kubectl create` for production.
2. **GitOps is the default.** Every manifest change goes through version control and automated sync (ArgoCD, Flux, or similar).
3. **Resource limits are mandatory.** Every container must have `requests` and `limits` for CPU and memory.
4. **Health probes are mandatory.** Every container must have `livenessProbe` and `readinessProbe`.
5. **Least privilege RBAC.** Every ServiceAccount has the minimum permissions required.

## Manifest Review Checklist

### Deployment / Pod Spec
- [ ] Resource `requests` and `limits` defined for all containers
- [ ] `livenessProbe` and `readinessProbe` defined
- [ ] `securityContext` sets `runAsNonRoot: true`, `readOnlyRootFilesystem: true` where possible
- [ ] `imagePullPolicy: Always` or pinned image digest (no implicit `IfNotPresent` with `latest`)
- [ ] `replicas` appropriate for the workload (not hardcoded to 1 for stateless services)
- [ ] `strategy` defined for rolling updates (`RollingUpdate` with `maxUnavailable`/`maxSurge`)

### Service / Ingress
- [ ] Service selector matches Deployment labels exactly
- [ ] Ingress has TLS configured (no plaintext HTTP in production)
- [ ] Ingress paths don't overlap ambiguously
- [ ] Backend service port matches container port

### Config / Secrets
- [ ] Secrets are base64-encoded (not plaintext in YAML)
- [ ] ConfigMaps don't contain sensitive data (use Secrets)
- [ ] Environment variables reference ConfigMaps/Secrets via `valueFrom` (not hardcoded)

### RBAC
- [ ] Role/ClusterRole has explicit verbs and resources (no wildcard `*`)
- [ ] ServiceAccount is explicitly defined (not default)
- [ ] Bindings are scoped to namespaces where possible

## Validation Commands

```bash
# Dry-run before apply
kubectl apply -f manifest.yaml --dry-run=server

# Validate with strict schema
kubectl apply -f manifest.yaml --dry-run=server --validate=strict

# Check resource usage vs limits
kubectl top pods -n <namespace>
kubectl describe node <node-name>

# Audit security posture
kubectl auth can-i --list --as=system:serviceaccount:<ns>:<sa>

# Helm validation
helm lint ./chart
helm template ./chart | kubectl apply --dry-run=server -f -
helm install --dry-run --debug release-name ./chart
```

## Resource Limits Template

```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "500m"
```

**Rules of thumb:**
- `requests` = observed steady-state usage + 20%
- `limits` = observed peak usage + 50%
- Memory limits are hard limits (OOMKill at limit)
- CPU limits are throttled, not killed

## Health Probe Patterns

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

- **Liveness:** Is the process alive? If failing, kubelet restarts the container.
- **Readiness:** Is the pod ready to serve traffic? If failing, pod is removed from Service endpoints.
- **Startup:** For slow-starting apps. Disables liveness/readiness until complete.

## Common Anti-Patterns

| Anti-Pattern | Why It's Wrong | Fix |
|---|---|---|
| No resource limits | Noisy neighbor, unpredictable OOMKills | Set `requests` and `limits` |
| `image: myapp:latest` | Non-reproducible deployments | Pin to digest or version tag |
| Running as root | Container escape risk | `securityContext.runAsNonRoot: true` |
| No health probes | Failed containers stay in rotation | `livenessProbe` + `readinessProbe` |
| Wildcard RBAC (`verbs: ["*"]`) | Principle of least privilege violation | Explicit verbs per resource |
| Hardcoding config in YAML | No environment separation | ConfigMaps + Secrets |
| Using default ServiceAccount | No audit trail, overprivileged | Explicit SA per workload |
| No PodDisruptionBudget | Voluntary disruptions cause downtime | Define `minAvailable` or `maxUnavailable` |

## Troubleshooting Flow

1. **Pod stuck Pending:** `kubectl describe pod` → check node resources, taints, PVC binding
2. **Pod CrashLoopBackOff:** `kubectl logs --previous` → check exit code, OOMKilled, application error
3. **Service not reachable:** Check selector match, endpoints (`kubectl get endpoints`), port alignment
4. **Ingress 502/503:** Check backend health, readiness probe, Service port
5. **High memory usage:** `kubectl top pod` → check limits, consider HPA or VPA
6. **RBAC denied:** `kubectl auth can-i <verb> <resource> --as=system:serviceaccount:<ns>:<sa>`

## Helm Best Practices

```yaml
# Chart.yaml
apiVersion: v2
name: myapp
description: A Helm chart for myapp
type: application
version: 1.0.0
appVersion: "2.0.0"
```

- Use `helm lint` in CI
- Template with `helm template` and pipe to `kubectl apply --dry-run=server`
- Store values per environment (`values-prod.yaml`, `values-staging.yaml`)
- Don't put secrets in `values.yaml` — use external secret operators

## Official Resources

- [Kubernetes API reference](https://kubernetes.io/docs/reference/kubernetes-api/)
- [kubectl cheat sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Helm docs](https://helm.sh/docs/)
- [Pod Security Standards](https://kubernetes.io/docs/concepts/security/pod-security-standards/)
- [RBAC docs](https://kubernetes.io/docs/reference/access-authn-authz/rbac/)
