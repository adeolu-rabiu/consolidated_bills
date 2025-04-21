const faker = require('faker');

function generateRandomUser(context, events, done) {
  const name = faker.name.findName();
  const email = faker.internet.email().toLowerCase();
  const password = faker.internet.password(10);
  const phone = faker.phone.phoneNumber('+447#########');
  const address = `${faker.address.streetAddress()}, ${faker.address.city()}, ${faker.address.zipCode()}`;
  
  context.vars.name = name;
  context.vars.email = email;
  context.vars.password = password;
  context.vars.phone = phone;
  context.vars.address = address;
  
  return done();
}

function generateRandomPostcodeAndUtilities(context, events, done) {
  const postcodes = ['NE1 7RU', 'EH1 1TG', 'M1 1AE', 'B1 1HQ', 'L1 8JQ', 'CF10 1EP', 'G1 5QR'];
  const utilities = ['electricity', 'gas', 'water', 'broadband'];
  
  const postcode = postcodes[Math.floor(Math.random() * postcodes.length)];
  
  // Select a random number of utilities (at least 1)
  const numUtilities = Math.floor(Math.random() * utilities.length) + 1;
  const selectedUtilities = [];
  
  // Randomly select utilities without duplicates
  const utilsCopy = [...utilities];
  for (let i = 0; i < numUtilities; i++) {
    const randomIndex = Math.floor(Math.random() * utilsCopy.length);
    selectedUtilities.push(utilsCopy[randomIndex]);
    utilsCopy.splice(randomIndex, 1);
  }
  
  context.vars.postcode = postcode;
  context.vars.utilities = selectedUtilities;
  
  return done();
}

module.exports = {
  generateRandomUser,
  generateRandomPostcodeAndUtilities
};

# Terraform Auto-Scaling Configuration
# File: infra/terraform/modules/ecs/auto-scaling.tf

resource "aws_appautoscaling_target" "php_biller" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.php_biller.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "php_biller_cpu" {
  name               = "php-biller-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.php_biller.resource_id
  scalable_dimension = aws_appautoscaling_target.php_biller.scalable_dimension
  service_namespace  = aws_appautoscaling_target.php_biller.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

resource "aws_appautoscaling_policy" "php_biller_memory" {
  name               = "php-biller-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.php_biller.resource_id
  scalable_dimension = aws_appautoscaling_target.php_biller.scalable_dimension
  service_namespace  = aws_appautoscaling_target.php_biller.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

resource "aws_appautoscaling_target" "node_user_service" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.node_user_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "node_user_service_cpu" {
  name               = "node-user-service-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.node_user_service.resource_id
  scalable_dimension = aws_appautoscaling_target.node_user_service.scalable_dimension
  service_namespace  = aws_appautoscaling_target.node_user_service.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

resource "aws_appautoscaling_policy" "node_user_service_memory" {
  name               = "node-user-service-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.node_user_service.resource_id
  scalable_dimension = aws_appautoscaling_target.node_user_service.scalable_dimension
  service_namespace  = aws_appautoscaling_target.node_user_service.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# EKS Cluster Autoscaler
resource "aws_iam_role_policy_attachment" "eks_cluster_autoscaler" {
  policy_arn = aws_iam_policy.eks_cluster_autoscaler.arn
  role       = aws_iam_role.eks_nodes.name
}

resource "aws_iam_policy" "eks_cluster_autoscaler" {
  name        = "consolidated_bills-eks-cluster-autoscaler"
  description = "Policy for EKS Cluster Autoscaler"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "autoscaling:DescribeAutoScalingGroups",
          "autoscaling:DescribeAutoScalingInstances",
          "autoscaling:DescribeLaunchConfigurations",
          "autoscaling:DescribeTags",
          "autoscaling:SetDesiredCapacity",
          "autoscaling:TerminateInstanceInAutoScalingGroup",
          "ec2:DescribeLaunchTemplateVersions"
        ]
        Resource = "*"
      }
    ]
  })
}

# Cost Optimization - EC2 Instances for EKS
resource "aws_eks_node_group" "spot_instances" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "consolidated_bills-spot-nodes"
  node_role_arn   = aws_iam_role.eks_nodes.arn
  subnet_ids      = var.subnet_ids
  
  scaling_config {
    desired_size = 2
    max_size     = 5
    min_size     = 1
  }
  
  capacity_type = "SPOT"
  instance_types = ["t3.small", "t3.medium"]
  
  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_registry_policy
  ]
}

# RDS Advanced Monitoring
resource "aws_db_instance" "main" {
  # ... (existing configuration)
  
  monitoring_interval = 60
  monitoring_role_arn = aws_iam_role.rds_monitoring.arn
}

resource "aws_iam_role" "rds_monitoring" {
  name = "consolidated_bills-rds-monitoring"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# Security Optimizations
resource "aws_security_group" "web_application_firewall" {
  name        = "consolidated_bills-waf-sg"
  description = "Security group for web application firewall"
  vpc_id      = var.vpc_id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# WAF Rules for API Gateway
resource "aws_wafv2_web_acl" "api_gateway" {
  name        = "consolidated_bills-api-waf-${var.environment}"
  description = "WAF rules for consolidated_bills API"
  scope       = "REGIONAL"
  
  default_action {
    allow {}
  }
  
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 0
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesCommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }
  
  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 1
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "AWSManagedRulesSQLiRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }
  
  rule {
    name     = "RateLimit"
    priority = 2
    
    action {
      block {}
    }
    
    statement {
      rate_based_statement {
        limit              = 1000
        aggregate_key_type = "IP"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitMetric"
      sampled_requests_enabled   = true
    }
  }
  
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "consolidated_bills-api-waf"
    sampled_requests_enabled   = true
  }
}

# Performance Optimization - ElastiCache Parameter Group
resource "aws_elasticache_parameter_group" "redis_optimized" {
  name   = "consolidated_bills-redis-optimized-${var.environment}"
  family = "redis6.x"
  
  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }
  
  parameter {
    name  = "activerehashing"
    value = "yes"
  }
}

# Update Redis cluster with optimization
resource "aws_elasticache_cluster" "main" {
  # ... (existing configuration)
  
  parameter_group_name = aws_elasticache_parameter_group.redis_optimized.name
}
