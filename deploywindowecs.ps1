# Configuration
$ECS_REGION = "ap-southeast-2"  # Where your ECS cluster lives
$ECR_REGION = "us-west-2"       # Where your ECR repo lives
$ECR_REPO = "324037283653.dkr.ecr.us-west-2.amazonaws.com/express-eks"
$CLUSTER_NAME = "nodejs-app-cluster"
$SERVICE_NAME = "ecs-service-new"
$TASK_DEFINITION = "nodejs-app"
$DOCKERFILE_PATH = ".\Dockerfile"

# ---------------------------
# 1. Authenticate with ECR (us-west-2)
# ---------------------------
$loginCommand = (aws ecr get-login-password --region $ECR_REGION) | docker login --username AWS --password-stdin $ECR_REPO
Write-Host "ECR Login: $loginCommand"

# ---------------------------
# 2. Build and push image (to us-west-2 ECR)
# ---------------------------
# Add --no-cache and rebuild
docker build --no-cache -t ${ECR_REPO}:latest -f $DOCKERFILE_PATH .
docker tag ${ECR_REPO}:latest ${ECR_REPO}:$(git rev-parse --short HEAD)
docker push "${ECR_REPO}:latest"
docker push "${ECR_REPO}:$(git rev-parse --short HEAD)"

# ---------------------------
# 3. Update ECS service (in ap-southeast-2)
# ---------------------------
Write-Host "Starting deployment to ECS..."
aws ecs update-service `
  --cluster $CLUSTER_NAME `
  --service $SERVICE_NAME `
  --task-definition $TASK_DEFINITION `
  --force-new-deployment `
  --region $ECS_REGION

# ---------------------------
# 4. Wait for completion
# ---------------------------
Write-Host "Waiting for deployment to stabilize..."
aws ecs wait services-stable `
  --cluster $CLUSTER_NAME `
  --services $SERVICE_NAME `
  --region $ECS_REGION

Write-Host "Deployment complete! Image from $ECR_REGION deployed to $ECS_REGION"