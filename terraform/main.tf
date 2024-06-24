provider "aws" {
  region = "eu-central-1" # Changed to Frankfurt region
}

resource "aws_iam_role" "beanstalk_role" {
  name = "beanstalk-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole",
      Principal = {
        Service = "ec2.amazonaws.com"
      },
      Effect = "Allow",
      Sid    = ""
    }]
  })
}

resource "aws_iam_role_policy_attachment" "beanstalk_role_policy" {
  role       = aws_iam_role.beanstalk_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_instance_profile" "beanstalk_profile" {
  name = "beanstalk-profile"
  role = aws_iam_role.beanstalk_role.name
}

resource "aws_s3_bucket" "recycler_app" {
  bucket = "recycler-app"
}

resource "aws_elastic_beanstalk_application" "app" {
  name        = "recycler-app-api"
  description = "Recycler API"
}

resource "aws_elastic_beanstalk_environment" "env" {
  name                = "recyler-api-env"
  application         = aws_elastic_beanstalk_application.app.name
  solution_stack_name = "64bit Amazon Linux 2023 v4.1.0 running Python 3.11" # Adjust based on your application

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.beanstalk_profile.name
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = "t3.micro"
  }

  setting {
    namespace = "aws:elasticbeanstalk:environment:process:default"
    name      = "HealthCheckPath"
    value     = "/"
  }

  # Pass RDS connection information as environment variables
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "POSTGRES_HOST"
    value     = aws_db_instance.default.address
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "POSTGRES_PORT"
    value     = "5432"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "POSTGRES_DB"
    value     = aws_db_instance.default.db_name
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "POSTGRES_USER"
    value     = aws_db_instance.default.username
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "POSTGRES_PASSWORD"
    value     = aws_db_instance.default.password
  }
}

resource "aws_db_instance" "default" {
  allocated_storage   = 20
  db_name             = "recyclerdb"
  engine              = "postgres"
  instance_class      = "db.t3.micro"
  password            = var.db_password
  publicly_accessible = true
  username            = var.db_user

  tags = {
    Name = "RecyclerDbInstance"
  }
}

variable "db_user" {
  description = "The username for the RDS instance"
  type        = string
  default     = "postgres_user"
}

variable "db_password" {
  description = "The password for the RDS instance"
  type        = string
  default     = "postgres_password"
}
