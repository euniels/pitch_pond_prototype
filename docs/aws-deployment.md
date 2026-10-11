# AWS Singapore deployment blueprint

Use one AWS organization with separate staging and production accounts in `ap-southeast-1`.

- Route 53 and ACM for DNS/TLS.
- CloudFront and WAF in front of an Application Load Balancer.
- ECS Fargate services for Next.js, Laravel API, queue workers, and the scheduler. Only the load balancer is public.
- RDS PostgreSQL Multi-AZ with encryption, automated backups, deletion protection, and Performance Insights.
- ElastiCache Redis with TLS and authentication for sessions, cache, queue coordination, and rate limiting.
- Private S3 buckets with versioning, KMS encryption, blocked public access, lifecycle rules, and a quarantine workflow for uploads.
- Secrets Manager for app keys and provider credentials; task roles replace static AWS keys.
- SES for email, CloudWatch/OpenTelemetry for service metrics and logs, and Sentry for application errors with PII scrubbing.
- GuardDuty, CloudTrail, AWS Config, Security Hub, budget alarms, and restricted break-glass administration.

Deployment uses immutable image tags, database migrations as a one-off task, health checks on `/up`, rolling services, and a tested rollback to the previous image. Production seeders never load development fixtures.
