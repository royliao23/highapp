# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

aws:
eks:

Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
choco install eksctl
eksctl version
 eksctl create cluster --name my-cluster 
 npm init
 npm install express --save
 deploy nodejs express to aws eks:
 node app.js
 docker build -t express-eks .
 docker run -p 3000:3000 -it --rm --name express-eks-run express-eks
 kubectl apply -f k8s.yaml
 kubectl get pod
  kubectl get svc
 kubectl config current-context
 aws eks list-clusters --region ap-southeast-2
 aws sts get-caller-identity
 .\deploywindow.ps1
docker rmi express-eks 

eksctl delete cluster --name my-cluster --region <your-aws-region>
eksctl get cluster --region <your-aws-region>
kubectl get nodes


ecs:

 npm init
 npm install express --save
 deploy nodejs express to aws ecs:
 node app.js
 docker build -t express-eks .
 docker run -p 3000:3000 -it --rm --name express-eks-run express-eks
 
  aws ec2 create-security-group --group-name ecs-nodejs-sg --description "ECS Node.js Security Group" --vpc-id vpc-066229078577dff3f --region ap-southeast-2 
   aws ec2 authorize-security-group-ingress --group-id sg-08f0d11729c4cf1c7 --protocol tcp --port 3000 --cidr 0.0.0.0/0 --region ap-southeast-2  
 aws elbv2 create-target-group --name nodejs-tg --protocol HTTP --port 80 --target-type ip --vpc-id vpc-066229078577dff3f --health-check-path / --region ap-southeast-2                   
 aws ecs register-task-definition --cli-input-json file://task-definition.json --region ap-southeast-2     
aws ecs create-cluster --cluster-name nodejs-app-cluster --region ap-southeast-2  
aws elbv2 create-load-balancer  --name nodejs-alb   --subnets subnet-071009d0cb0319bbf subnet-09dcf4f071eb69b1f   --security-groups sg-08f0d11729c4cf1c7   --region ap-southeast-2      
aws elbv2 describe-load-balancers --names nodejs-alb --region ap-southeast-2 --query "LoadBalancers[0].Listeners"   
aws elbv2 create-listener   --load-balancer-arn $(aws elbv2 describe-load-balancers --names nodejs-alb --region ap-southeast-2 --query "LoadBalancers[0].LoadBalancerArn" --output text)   --protocol HTTP   --port 80   --default-actions Type=forward,TargetGroupArn=$(aws elbv2 describe-target-groups --names nodejs-tg --region ap-southeast-2 --query "TargetGroups[0].TargetGroupArn" --output text)   --region ap-southeast-2 
aws ecs create-service  --cluster nodejs-app-cluster  --service-name ecs-service-new  --task-definition nodejs-app:1   --desired-count 1  --launch-type FARGATE   --network-configuration "awsvpcConfiguration={subnets=[subnet-071009d0cb0319bbf,subnet-09dcf4f071eb69b1f],securityGroups=[sg-08f0d11729c4cf1c7],assignPublicIp=ENABLED}"   --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:ap-southeast-2:324037283653:targetgroup/nodejs-tg/813b530a981a5386,containerName=nodejs-app,containerPort=3000"   --region ap-southeast-2
aws logs create-log-group   --log-group-name /ecs/nodejs-app   --region ap-southeast-2 
 aws logs describe-log-groups   --log-group-name-prefix /ecs/nodejs-app   --region ap-southeast-2
 aws ecs describe-task-definition   --task-definition nodejs-app:1   --region ap-southeast-2   --query "taskDefinition.executionRoleArn" 
 aws iam attach-role-policy   --role-name ecsTaskExecutionRole   --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess   --region ap-southeast-2 
  aws elbv2 describe-target-health  --target-group-arn arn:aws:elasticloadbalancing:ap-southeast-2:324037283653:targetgroup/nodejs-tg/813b530a981a5386  --region ap-southeast-2
  aws logs create-log-group   --log-group-name /ecs/nodejs-app   --region ap-southeast-2aws logs create-log-group   --log-group-name /ecs/nodejs-app   --region ap-southeast-2aws logs create-log-group   --log-group-name /ecs/nodejs-app   --region ap-southeast-2aws logs create-log-group   --log-group-name /ecs/nodejs-app   --region ap-southeast-2aws logs create-log-group   --log-group-name /ecs/nodejs-app   --region ap-southeast-2aws logs create-log-group   --log-group-name /ecs/nodejs-app   --region ap-southeast-2
 aws logs create-log-group   --log-group-name /ecs/nodejs-app   --region ap-southeast-2
 aws logs describe-log-groups   --log-group-name-prefix /ecs/nodejs-app   --region ap-southeast-2  
 aws ecs describe-task-definition   --task-definition nodejs-app:1   --region ap-southeast-2   --query "taskDefinition.executionRoleArn" 
aws iam attach-role-policy   --role-name ecsTaskExecutionRole   --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess   --region ap-southeast-2
aws ecs update-service `  --cluster nodejs-app-cluster `  --service ecs-service-new `  --force-new-deployment `  --region ap-southeast-2 
aws elbv2 describe-target-health `  --target-group-arn arn:aws:elasticloadbalancing:ap-southeast-2:324037283653:targetgroup/nodejs-tg/813b530a981a5386 `  --region ap-southeast-2
 . 'C:\Users\roy_y\codes\eks\deploywindowecs.ps1'

aws logs tail /ecs/nodejs-app `
  --region ap-southeast-2 `
  --log-stream-name-prefix "ecs/nodejs-app" `
  --since 1h

# Check new task status
aws ecs describe-tasks `
  --cluster nodejs-app-cluster `
  --tasks $(aws ecs list-tasks --cluster nodejs-app-cluster --service-name ecs-service-new --region ap-southeast-2 --query "taskArns[0]" --output text) `
  --region ap-southeast-2 `
  --query "tasks[0].containers[0].{Image:image,Memory:memory,LastStatus:lastStatus}"