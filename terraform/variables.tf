variable "vpc_id" {
  description = "The ID of the existing VPC"
  type        = string
}

variable "subnet_ids" {
  description = "The IDs of the existing subnets"
  type        = list(string)
}

variable "rds_password" {
  description = "The password for the RDS instance"
  type        = string
  sensitive   = true
}
