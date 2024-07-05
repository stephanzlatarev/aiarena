# AI Arena Kibitz

Running on https://aiarena.superskill.me

## Deployment

1. Get a Kubernetes cluster

2. Install NGINX Ingress Controller. See https://kubernetes.github.io/ingress-nginx/deploy

```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml
```

3. Install cert-manager. See https://cert-manager.io/docs/installation/kubectl

```
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.15.1/cert-manager.yaml
```

4. Deploy kubernetes.yaml
