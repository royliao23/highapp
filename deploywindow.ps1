# deploy.ps1
$APP_NAME = "nodejs-app"
$DOCKER_IMAGE = "324037283653.dkr.ecr.us-west-2.amazonaws.com/express-eks"  # ECR repo or Docker Hub
$AWS_REGION = "ap-southeast-2"
$EKS_CLUSTER = "my-cluster"

# Step 1: Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Step 2: Build & Push Docker Image
docker build -t ${DOCKER_IMAGE}:latest .
docker tag ${DOCKER_IMAGE}:latest ${DOCKER_IMAGE}:$(git rev-parse --short HEAD)
docker push "${DOCKER_IMAGE}:latest"
docker push "${DOCKER_IMAGE}:$(git rev-parse --short HEAD)"

# Step 3: Update Kubernetes
kubectl set image deployment/$APP_NAME ${APP_NAME}=${DOCKER_IMAGE}:$(git rev-parse --short HEAD)

# Step 4: Verify
kubectl rollout status deployment/$APP_NAME --timeout=90s
kubectl get pods -l app=$APP_NAME
kubectl get svc ${APP_NAME}-service