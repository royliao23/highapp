#!/bin/bash

# Configuration
APP_NAME="nodejs-app"               # Must match your Deployment name
DOCKER_IMAGE="324037283653.dkr.ecr.us-west-2.amazonaws.com/express-eks"  # ECR repo or Docker Hub
AWS_REGION="ap-southeast-2"         # Match your EKS cluster region
EKS_CLUSTER="my-cluster"            # Your EKS cluster name
K8S_NAMESPACE="default"             # Kubernetes namespace

# Step 1: Login to AWS ECR (if using ECR)
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin 324037283653.dkr.ecr.$AWS_REGION.amazonaws.com

# Step 2: Build & Push Docker Image
docker build -t $DOCKER_IMAGE:latest .
docker tag $DOCKER_IMAGE:latest $DOCKER_IMAGE:$(git rev-parse --short HEAD)  # Tag with Git commit hash
docker push $DOCKER_IMAGE:latest
docker push $DOCKER_IMAGE:$(git rev-parse --short HEAD)

# Step 3: Update Kubernetes Deployment
kubectl set image deployment/$APP_NAME $APP_NAME=$DOCKER_IMAGE:$(git rev-parse --short HEAD) -n $K8S_NAMESPACE

# Step 4: Verify Rollout Status
echo "Waiting for rollout to complete..."
kubectl rollout status deployment/$APP_NAME -n $K8S_NAMESPACE --timeout=90s

# Step 5: Check Pods and Service
echo "\nCurrent Pods:"
kubectl get pods -n $K8S_NAMESPACE -l app=$APP_NAME

echo "\nService Endpoint:"
kubectl get svc $APP_NAME-service -n $K8S_NAMESPACE