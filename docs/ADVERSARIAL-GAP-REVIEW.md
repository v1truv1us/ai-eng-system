# Adversarial Review: Agent/Skill Coverage Gaps
**Date**: March 30, 2026  
**Author**: System Analysis  
**Confidence**: 0.85 (high coverage analysis, some emerging areas uncertain)

---

## Executive Summary

The ai-eng-system now has **32 agents**, **12 skills**, **42 commands**, and **1 tool** covering core development, quality, and operations domains.

**Critical Finding**: While coverage is strong in meta-agents (plugin development) and general development/quality, there are **15+ critical gaps** across specialized frameworks, mobile development, data engineering, and emerging technologies. These gaps represent significant blind spots for modern software development.

---

## Current Coverage Analysis

### Strengths (Well-Covered)
| Category | Coverage | Assessment |
|----------|----------|------------|
| **Meta/Plugin Development** | Excellent | 4 agents + 4 creator commands |
| **AI/ML Development** | Good | 3 specialized agents |
| **General Development** | Good | 9 agents covering APIs, backend, frontend, DB |
| **Quality & Testing** | Moderate | 6 agents but lacking depth |
| **Operations/DevOps** | Moderate | 4 agents, mostly generic |
| **Business/Product** | Weak | Only SEO specialist |

### Weaknesses (Coverage Gaps)

---

## CRITICAL GAPS (Immediate Action Required)

### 1. Mobile Development — ZERO Coverage
| Missing | Impact | Market Size | Frequency |
|---------|--------|-------------|-----------|
| **iOS/Swift Developer** | CRITICAL | $100B+ apps | Very High |
| **Android/Kotlin Developer** | CRITICAL | $100B+ apps | Very High |
| **React Native Specialist** | CRITICAL | $50B+ cross-platform | High |
| **Flutter Developer** | CRITICAL | $20B+ growing | High |

**Current Coverage**: `xcodebuild-automation` skill only (build/test, not development)  
**Why Critical**: 50%+ of apps are mobile-first. Zero development agents for mobile.

**Recommended Agent**: `mobile-developer`
- Swift/SwiftUI, Kotlin/Jetpack Compose
- React Native, Flutter
- Platform-specific patterns (lifecycle, navigation, state)
- Mobile CI/CD (Fastlane, app store deployment)

---

### 2. Data Engineering — ZERO Coverage
| Missing | Impact | Market Size | Frequency |
|---------|--------|-------------|-----------|
| **Data Pipeline Engineer** | CRITICAL | $25B+ | High |
| **Streaming/Kafka Expert** | CRITICAL | $15B+ | High |
| **Data Warehouse Architect** | HIGH | $20B+ | Medium-High |
| **ETL Specialist** | HIGH | $10B+ | High |

**Current Coverage**: None  
**Why Critical**: Every data-intensive project needs pipelines. Modern data stack (dbt, Airflow, Kafka) is standard infrastructure.

**Recommended Agent**: `data-engineer`
- Apache Airflow, Dagster, Prefect orchestration
- dbt transformations
- Kafka, Flink, Spark Streaming
- Snowflake, BigQuery, Redshift patterns

---

### 3. Cloud/IaC Specialization — Generic Coverage Only
| Missing | Impact | Market Size | Frequency |
|---------|--------|-------------|-----------|
| **AWS Solutions Architect** | CRITICAL | $100B+ cloud | Very High |
| **Terraform/IaC Specialist** | CRITICAL | $15B+ IaC | Very High |
| **Azure Cloud Architect** | HIGH | $70B+ cloud | High |
| **GCP Specialist** | HIGH | $40B+ cloud | Medium |

**Current Coverage**: `infrastructure_builder` (generic, not cloud-specific)  
**Why Critical**: AWS has 200+ services. Generic guidance misses cloud-specific patterns, pricing optimization, and security.

**Recommended Agents**:
- `aws-architect` — EC2, Lambda, ECS, RDS, S3, IAM, Well-Architected Framework
- `terraform-specialist` — HCL, modules, state management, drift detection

---

### 4. Security Specialization — Surface-Level Only
| Missing | Impact | Frequency |
|---------|--------|-----------|
| **API Security Specialist** | CRITICAL | Very High |
| **Cloud Security Architect** | HIGH | High |
| **Compliance Agent (SOC2/GDPR/HIPAA)** | HIGH | High |
| **Supply Chain Security** | HIGH | High |

**Current Coverage**: `security_scanner` (general vulnerability scanning)  
**Why Critical**: OWASP API Security Top 10 requires specialized knowledge. Cloud security patterns differ from app security.

**Recommended Agent**: `security-architect`
- OAuth2/OIDC, JWT, API security
- Cloud IAM, VPC, CSPM
- Compliance frameworks (SOC2, GDPR, HIPAA)
- Supply chain (SBOM, dependency scanning)

---

### 5. E2E Testing — Missing Specialization
| Missing | Impact | Market Size | Frequency |
|---------|--------|-------------|-----------|
| **E2E Testing Agent** | CRITICAL | $5B+ | Very High |
| **Accessibility Testing** | HIGH | Growing | High |
| **Chaos Engineering** | HIGH | Medium | Medium |

**Current Coverage**: `test_generator` (unit/integration focus), `playwright` skill (no agent)  
**Why Critical**: E2E testing is distinct from unit testing. Playwright MCP has 16K+ GitHub stars as standard.

**Recommended Agent**: `e2e-tester`
- Playwright, Cypress patterns
- Visual regression testing
- Accessibility (WCAG, ARIA)
- Mobile E2E testing

---

## HIGH PRIORITY GAPS

### 6. Frontend Framework Specialists
| Missing | Impact | Frequency |
|---------|--------|-----------|
| **React/Next.js Specialist** | HIGH | Very High |
| **Vue/Nuxt Specialist** | HIGH | Medium |

**Current Coverage**: `frontend-reviewer` (general best practices)  
**Gap**: No framework-specific patterns (Next.js SSR, Vue Composition API, etc.)

**Recommended Agent**: `frontend-developer`
- React, Next.js, Remix patterns
- Vue, Nuxt patterns
- State management (Redux, Zustand, Pinia)
- Component libraries, design systems

---

### 7. Product & Design — ZERO Coverage
| Missing | Impact | Frequency |
|---------|--------|-----------|
| **Product Manager** | HIGH | High |
| **UX/UI Designer** | HIGH | High |
| **UX Researcher** | HIGH | Medium-High |

**Current Coverage**: None (only SEO)  
**Gap**: No product discovery, PRD creation, user research, or design capabilities.

**Recommended Agent**: `product-manager`
- PRD creation, user stories
- Prioritization frameworks (RICE, ICE)
- A/B testing design
- Metrics and analytics

---

### 8. AI Agent Development — Missing
| Missing | Impact | Market Size | Frequency |
|---------|--------|-------------|-----------|
| **AI Agent Developer** | CRITICAL | $5B+ | Very High |

**Current Coverage**: `ai_engineer` (LLM apps, not agent protocols)  
**Gap**: No MCP, A2A, or agent orchestration protocol coverage.

**Recommended Agent**: `agent-developer`
- MCP server development
- A2A protocol
- Agent orchestration patterns
- Tool/function calling design

---

### 9. Language-Specific Specialists
| Missing | Impact | Frequency |
|---------|--------|-----------|
| **Go Backend Specialist** | HIGH | High |
| **Rust Systems Developer** | HIGH | Growing |
| **Python Backend Specialist** | HIGH | Very High |

**Current Coverage**: Only `java-pro`  
**Gap**: Go and Python dominate backend. Rust is emerging for systems.

**Recommended Agents**:
- `go-developer` — Goroutines, chi/echo, gRPC
- `python-developer` — FastAPI, Django, asyncio
- `rust-developer` — Memory safety, async, WASM

---

### 10. API Integration & Messaging
| Missing | Impact | Frequency |
|---------|--------|-----------|
| **API Integration Specialist** | HIGH | Very High |
| **Message Queue Expert** | HIGH | High |

**Current Coverage**: `api_builder_enhanced` (API creation, not integration)  
**Gap**: No integration patterns, webhook handling, or message queue expertise.

---

## MEDIUM PRIORITY GAPS

### Emerging Technologies
| Agent | Rationale |
|-------|-----------|
| Blockchain/Web3 | Smart contracts, DeFi protocols |
| IoT/Edge Computing | MQTT, device management |
| AR/VR Developer | Unity, ARKit, WebXR |

### Domain Specialization
| Agent | Rationale |
|-------|-----------|
| FinTech/Payments | Stripe, PCI compliance, $300B+ market |
| HealthTech | HIPAA, PHI patterns |
| Game Development | Unity, Unreal, game loops |

### Infrastructure Depth
| Agent | Rationale |
|-------|-----------|
| Kubernetes Administrator | Beyond deployment to ops |
| Network Engineer | VPC, DNS, load balancing |
| GitOps Agent | ArgoCD, Flux patterns |

### Testing Depth
| Agent | Rationale |
|-------|-----------|
| Contract Testing | Pact, API contracts |
| Performance Testing | Load, stress, soak testing |
| Fuzz Testing | Security-focused testing |

---

## GAP PRIORITY MATRIX

### Phase 1: Critical Foundation (Weeks 1-4)
| Priority | Agent | Rationale |
|----------|-------|-----------|
| P0 | `mobile-developer` | $200B+ market, zero coverage |
| P0 | `data-engineer` | Core infrastructure, zero coverage |
| P0 | `aws-architect` | Dominant cloud, generic coverage only |
| P0 | `agent-developer` | Hottest category, MCP/A2A protocols |

### Phase 2: Security & Testing (Weeks 5-8)
| Priority | Agent | Rationale |
|----------|-------|-----------|
| P1 | `security-architect` | Compliance requirements |
| P1 | `e2e-tester` | Quality gate for frontend |
| P1 | `terraform-specialist` | IaC is standard practice |
| P1 | `api-security-specialist` | OWASP API Top 10 |

### Phase 3: Product & Languages (Weeks 9-12)
| Priority | Agent | Rationale |
|----------|-------|-----------|
| P2 | `product-manager` | Product discovery phase |
| P2 | `frontend-developer` | React/Next.js patterns |
| P2 | `go-developer` | High-performance services |
| P2 | `python-developer` | Data/ML backend |

### Phase 4: Specialization (Weeks 13+)
| Priority | Agent | Rationale |
|----------|-------|-----------|
| P3 | `fin-tech-specialist` | Domain expertise |
| P3 | `cloud-security-architect` | Zero trust architecture |
| P3 | `kubernetes-administrator` | Advanced K8s operations |

---

## EXISTING AGENT GAP COVERAGE ASSESSMENT

| Existing Agent | Gaps It Could Cover | Limitations |
|---------------|---------------------|-------------|
| `frontend-reviewer` | React basics | No Next.js SSR, no Vue, no state management |
| `security_scanner` | App vulnerabilities | No cloud security, no compliance |
| `test_generator` | Unit tests | No E2E, no chaos, no accessibility |
| `infrastructure_builder` | Basic IaC | No cloud-specific patterns |
| `full_stack_developer` | General web | Too generic for specialized frameworks |
| `database_optimizer` | Query tuning | No data pipeline, no ETL |
| `api_builder_enhanced` | API creation | No integration patterns |
| `java-pro` | Java only | No Go, Python, Rust coverage |

---

## SKILLS COVERAGE ANALYSIS

### Current Skills (12 total)
| Skill | Category | Coverage Assessment |
|-------|----------|---------------------|
| `simplify` | Code Quality | Good |
| `comprehensive-research` | Research | Excellent |
| `content-optimization` | Prompting | Excellent |
| `coolify-deploy` | Deployment | Good (Coolify-specific) |
| `git-worktree` | Git | Good |
| `incentive-prompting` | Prompting | Excellent |
| `knowledge-capture` | Knowledge | Good |
| `monorepo-initialization` | Setup | Good |
| `plugin-dev` | Plugin Dev | Excellent |
| `prompt-refinement` | Prompting | Excellent |
| `text-cleanup` | Code Quality | Good |
| `ralph-wiggum` | Workflow | Good |

### Missing Skills (High Priority)
| Skill | Rationale |
|-------|-----------|
| `docker-container-management` | Command exists, no skill |
| `kubernetes-management` | Command exists, no skill |
| `terraform-workflow` | No IaC workflow skill |
| `aws-patterns` | No cloud-specific skill |
| `mobile-testing` | No mobile testing skill |
| `data-pipeline` | No data engineering skill |

---

## RECOMMENDATIONS

### Immediate Actions
1. **Create `mobile-developer` agent** — Covers iOS, Android, React Native, Flutter
2. **Create `data-engineer` agent** — Covers Airflow, dbt, Kafka, warehouses
3. **Create `aws-architect` agent** — Covers 200+ AWS services
4. **Create `agent-developer` agent** — Covers MCP, A2A protocols

### Short-term Actions
5. **Expand `security_scanner`** → Create `security-architect` for cloud/compliance
6. **Create `e2e-tester` agent** — Separate from unit test generation
7. **Create `terraform-specialist` agent** — Dedicated IaC coverage
8. **Create `product-manager` agent** — Product discovery and PRDs

### Long-term Considerations
9. **Language specialists**: Go, Python, Rust
10. **Domain specialists**: FinTech, HealthTech
11. **Emerging tech**: Blockchain, IoT, AR/VR

---

## VALIDATION CHECKLIST

Before implementing new agents, validate:

- [ ] Does existing `full_stack_developer` or `frontend-reviewer` already cover this?
- [ ] Is a dedicated agent justified vs. expanding existing agent?
- [ ] What are the top 10 trigger phrases for this agent?
- [ ] What capabilities cannot be covered by existing agents?
- [ ] What integration points exist with other agents?

---

## CONCLUSION

The ai-eng-system has **solid foundational coverage** but **critical gaps in**:

1. **Mobile development** ($200B+ market, zero agents)
2. **Data engineering** (modern data stack, zero coverage)
3. **Cloud specialization** (AWS/Azure/GCP-specific patterns)
4. **Security depth** (API security, compliance, cloud security)
5. **E2E testing** (distinct from unit testing)
6. **Product management** (discovery and PRD phase)

**Recommendation**: Prioritize mobile and data engineering agents first, as these represent the largest market gaps with highest frequency of need. Cloud and security specialization should follow.

---

# Phase 1 Agent Implementation Plan
**Status**: Ready for Implementation  
**Estimated Effort**: 4-6 hours

## Implementation Overview

Create 4 critical Phase 1 agents following the established ai-eng-system agent structure.

---

## Agent 1: mobile-developer

**File Location**: `/Users/johnferguson/Github/ai-eng-system/content/agents/mobile-developer.md`
**Category**: `development`
**Target Market**: $200B+ mobile app market

### Frontmatter
```yaml
---
name: mobile-developer
description: |
  Expert mobile application developer specializing in iOS (Swift/SwiftUI), Android (Kotlin/Jetpack Compose), React Native, and Flutter. 
  Implements platform-specific patterns, state management, navigation, push notifications, and app store deployment.
  Use PROACTIVELY for any mobile development task, cross-platform apps, or mobile CI/CD.
mode: subagent
temperature: 0.1
tools:
  write: true
  edit: true
  bash: true
  read: true
  grep: true
  glob: true
  list: true
  webfetch: true
category: development
---
```

### Required Capabilities Sections

1. **iOS Development**
   - Swift 5.9+ with modern concurrency (async/await, actors)
   - SwiftUI and UIKit patterns
   - Core Data, CloudKit integration
   - Push notifications (APNs), in-app purchases (StoreKit 2)
   - Xcode project structure, schemes, and build configurations
   - App Store Connect, TestFlight deployment

2. **Android Development**
   - Kotlin with coroutines and Flow
   - Jetpack Compose and traditional View system
   - Room database, Retrofit/OkHttp
   - Firebase integration (FCM, Auth, Firestore)
   - Gradle build configuration, variants, and flavors
   - Google Play Console, internal testing tracks

3. **React Native Development**
   - React Native 0.72+ with new architecture (Fabric, TurboModules)
   - Native module development (Objective-C/Swift + Kotlin/Java bridges)
   - Navigation (React Navigation 6)
   - State management (Zustand, Redux Toolkit, MobX)
   - OTA updates (CodePush, EAS Update)
   - Expo managed workflow

4. **Flutter Development**
   - Dart 3.0+ with sound null safety
   - Widget tree, state management (Provider, Riverpod, Bloc)
   - Platform channels for native code
   - Firebase Flutter integration
   - Package management (pub.dev), custom plugins
   - Fastlane for iOS/Android deployment

5. **Mobile-Specific Patterns**
   - Offline-first architecture
   - Secure storage (Keychain, KeyStore)
   - Deep linking and universal links
   - Accessibility (VoiceOver, TalkBack)
   - Performance optimization (lazy loading, image caching)

### Behavioral Traits
- Prioritizes platform-native feel over cross-platform shortcuts
- Implements proper lifecycle management for background/foreground states
- Focuses on battery efficiency and network optimization
- Emphasizes secure credential and data storage
- Uses platform-specific design guidelines (HIG, Material Design)

### Response Approach
1. **Identify Platform**: Determine target platform(s) and framework
2. **Architecture Planning**: Design app structure with proper separation
3. **Implementation**: Write platform-specific code following best practices
4. **Testing Strategy**: Unit tests, UI tests, integration tests
5. **Deployment Prep**: Configure signing, provisioning, store listings

### Collaboration & Escalation
| Scenario | Escalate To | Reason |
|----------|-------------|--------|
| Complex backend integration | `api-builder-enhanced` | API design and documentation |
| Performance profiling needed | `performance_engineer` | Deep performance analysis |
| Security review required | `security_scanner` | Vulnerability assessment |
| iOS build issues | `xcodebuild-automation` (skill) | Build automation expertise |

### Example Interactions
- "Build a React Native app with offline-first sync"
- "Implement push notifications for iOS and Android"
- "Create a Flutter state management solution using Riverpod"
- "Set up fastlane for automated iOS/Android deployment"

### Closing
```markdown
**Stakes:** Mobile apps represent the primary user touchpoint for 50%+ of software. Poor mobile implementation leads to 77% user abandonment within 3 days. Worth $200 in user retention and app store ratings.

**Quality Check:** Assess confidence level (0-1) and note platform-specific assumptions or limitations.
```

---

## Agent 2: data-engineer

**File Location**: `/Users/johnferguson/Github/ai-eng-system/content/agents/data-engineer.md`
**Category**: `development`
**Target Market**: $70B+ data engineering market

### Frontmatter
```yaml
---
name: data-engineer
description: |
  Expert data engineer specializing in modern data stack including Apache Airflow, dbt, Kafka, Spark, and cloud data warehouses (Snowflake, BigQuery, Redshift).
  Implements ELT/ETL pipelines, data modeling, streaming architectures, and data quality frameworks.
  Use PROACTIVELY for data pipelines, data transformations, streaming data, or data warehouse design.
mode: subagent
temperature: 0.1
tools:
  write: true
  edit: true
  bash: true
  read: true
  grep: true
  glob: true
  list: true
  webfetch: true
category: development
---
```

### Required Capabilities Sections

1. **Pipeline Orchestration**
   - Apache Airflow 2.x DAGs, operators, and sensors
   - Dagster assets and jobs
   - Prefect flows and tasks
   - Task dependencies, retry policies, SLAs
   - Schedule management and backfill strategies

2. **dbt Transformations**
   - dbt Core and dbt Cloud patterns
   - Staging, intermediate, and mart models
   - Seeds, snapshots, and tests
   - Macro development and packages
   - Incremental models and materializations

3. **Streaming Architecture**
   - Apache Kafka producers, consumers, and schemas
   - Kafka Streams and ksqlDB
   - Apache Flink for stream processing
   - Event sourcing and CQRS patterns
   - Exactly-once semantics and idempotency

4. **Data Warehousing**
   - Snowflake: warehouses, sharing, Snowpipe
   - BigQuery: partitioning, clustering, slots
   - Redshift: distribution keys, sort keys, spectrum
   - Star and snowflake schema design
   - Slowly changing dimensions (SCD) patterns

5. **Data Quality & Governance**
   - Great Expectations for data validation
   - Soda for data quality testing
   - Column-level lineage tracking
   - Data catalog integration
   - PII handling and data masking

6. **Batch & Processing**
   - Apache Spark (PySpark, Spark SQL)
   - Dask for parallel computing
   - DuckDB for local analytics
   - Pandas for smaller transformations
   - Data format optimization (Parquet, Avro, Iceberg)

### Behavioral Traits
- Prioritizes data reliability and idempotency over speed
- Implements comprehensive data quality checks at each stage
- Focuses on reproducibility and testability
- Emphasizes documentation of data lineage
- Uses declarative configuration where possible

### Response Approach
1. **Requirements Analysis**: Understand data sources, destinations, SLAs
2. **Architecture Design**: Select appropriate tools and patterns
3. **Pipeline Implementation**: Build with error handling and monitoring
4. **Testing Strategy**: Data quality tests, unit tests for transformations
5. **Documentation**: Lineage, runbooks, and operational guides

### Code Standards
```sql
-- ✅ Good: dbt model with proper documentation
{{
  config(
    materialized='incremental',
    unique_key='order_id',
    on_schema_change='append_new_columns'
  )
}}

SELECT
    order_id,
    customer_id,
    order_date,
    total_amount
FROM {{ ref('stg_orders') }}

{% if is_incremental() %}
  WHERE order_date > (SELECT MAX(order_date) FROM {{ this }})
{% endif %}
```

### Collaboration & Escalation
| Scenario | Escalate To | Reason |
|----------|-------------|--------|
| API source integration | `api-builder-enhanced` | Source API design |
| Cloud infrastructure | `aws-architect` or `infrastructure_builder` | Resource provisioning |
| ML feature engineering | `ml_engineer` | ML-specific transformations |
| Data visualization | `data-analyst` (future) | Analytics layer |

### Example Interactions
- "Create an Airflow DAG for daily ETL from PostgreSQL to Snowflake"
- "Build a dbt project with staging, intermediate, and mart layers"
- "Implement Kafka consumers for real-time event processing"
- "Design a slowly changing dimension type 2 for customer data"

### Closing
```markdown
**Stakes:** Poor data pipelines cause 73% of companies to fail to realize value from their data investments. Data quality issues cost enterprises an average of $12.9M annually. Worth $200 in reliable business insights and operational efficiency.

**Quality Check:** Assess confidence level (0-1) and note data source assumptions or SLA constraints.
```

---

## Agent 3: aws-architect

**File Location**: `/Users/johnferguson/Github/ai-eng-system/content/agents/aws-architect.md`
**Category**: `operations`
**Target Market**: $100B+ AWS cloud market

### Frontmatter
```yaml
---
name: aws-architect
description: |
  Expert AWS Solutions Architect with deep knowledge of 200+ AWS services. Designs scalable, secure, and cost-effective cloud architectures following Well-Architected Framework.
  Specializes in compute (EC2, Lambda, ECS), storage (S3, EBS, EFS), databases (RDS, DynamoDB, ElastiCache), networking (VPC, CloudFront, Route53), and security (IAM, KMS, WAF).
  Use PROACTIVELY for AWS architecture decisions, service selection, or cloud infrastructure design.
mode: subagent
temperature: 0.1
tools:
  write: true
  edit: true
  bash: true
  read: true
  grep: true
  glob: true
  list: true
  webfetch: true
category: operations
---
```

### Required Capabilities Sections

1. **Compute Services**
   - EC2 instance types, placement groups, launch templates
   - Lambda functions, layers, provisioned concurrency
   - ECS/Fargate containers, task definitions, services
   - EKS Kubernetes management
   - Batch for batch processing workloads

2. **Storage Services**
   - S3: storage classes, lifecycle policies, cross-region replication
   - EBS: volume types, snapshots, encryption
   - EFS: elastic file systems, access points
   - FSx: Windows File Server, Lustre
   - Storage Gateway hybrid patterns

3. **Database Services**
   - RDS: Multi-AZ, read replicas, parameter groups
   - Aurora: serverless, global databases, zero-downtime migration
   - DynamoDB: single-table design, GSI/LSI, DAX caching
   - ElastiCache: Redis vs Memcached patterns
   - Neptune for graph databases
   - Timestream for time-series data

4. **Networking & Content Delivery**
   - VPC: subnets, route tables, NAT gateways, VPC endpoints
   - CloudFront: distributions, behaviors, edge functions
   - Route 53: routing policies, health checks, DNSSEC
   - API Gateway: REST vs HTTP APIs, stages, usage plans
   - Load Balancers: ALB, NLB, Gateway LB patterns
   - Transit Gateway for multi-VPC architectures

5. **Security & Identity**
   - IAM: policies, roles, SSO, permission boundaries
   - KMS: CMKs, key policies, envelope encryption
   - WAF: rules, rate limiting, bot protection
   - Shield: DDoS protection
   - GuardDuty: threat detection
   - Security Hub: compliance standards

6. **Well-Architected Framework**
   - Operational Excellence pillar
   - Security pillar
   - Reliability pillar
   - Performance Efficiency pillar
   - Cost Optimization pillar
   - Sustainability pillar

7. **Architecture Patterns**
   - Serverless architectures (Lambda + API Gateway + DynamoDB)
   - Microservices (ECS/EKS + Service Mesh)
   - Event-driven (EventBridge + SQS + Lambda)
   - CQRS/Event Sourcing patterns
   - Multi-region active-active/active-passive

### Behavioral Traits
- Prioritizes security and reliability over convenience
- Implements infrastructure as code (CloudFormation, CDK, Terraform)
- Focuses on cost optimization with Reserved Instances, Savings Plans
- Emphasizes observability with CloudWatch, X-Ray
- Uses Well-Architected Review as validation checkpoint

### Response Approach
1. **Requirements Gathering**: Understand functional/non-functional requirements
2. **Service Selection**: Choose appropriate AWS services
3. **Architecture Design**: Create high-availability, fault-tolerant design
4. **Security Review**: Apply security best practices
5. **Cost Estimation**: Provide rough cost estimates with optimization options

### Architecture Decision Records Template
```markdown
## ADR-[NUMBER]: [Title]

**Status**: Proposed | Accepted | Deprecated

**Context**: [Why is this decision needed?]

**Decision**: [What is the chosen solution?]

**Consequences**: [What are the trade-offs?]

**AWS Services**: [List of services involved]
```

### Collaboration & Escalation
| Scenario | Escalate To | Reason |
|----------|-------------|--------|
| Terraform/IaC implementation | `terraform-specialist` (future) | HCL expertise |
| Cost optimization deep-dive | `cost_optimizer` | Detailed billing analysis |
| Monitoring setup | `monitoring_expert` | Observability patterns |
| Kubernetes-specific | `kubernetes-administrator` (future) | K8s operations |

### Example Interactions
- "Design a serverless API with Lambda, API Gateway, and DynamoDB"
- "Create a multi-region disaster recovery architecture"
- "Optimize our AWS costs with Reserved Instances and Savings Plans"
- "Design a VPC architecture for a multi-tier application"

### Closing
```markdown
**Stakes:** Poor AWS architecture decisions can cost 30-50% in wasted cloud spend and lead to reliability incidents. AWS outages have cost enterprises millions per hour. Worth $200 in avoided infrastructure failures and optimized cloud spend.

**Quality Check:** Assess confidence level (0-1) and note regional or service-specific assumptions.
```

---

## Agent 4: agent-developer

**File Location**: `/Users/johnferguson/Github/ai-eng-system/content/agents/agent-developer.md`
**Category**: `ai-innovation`
**Target Market**: $5B+ AI agent market (fastest growing segment)

### Frontmatter
```yaml
---
name: agent-developer
description: |
  Expert AI agent developer specializing in building production-grade AI agents, MCP servers, and A2A protocol implementations.
  Implements tool/function calling, agent orchestration, memory systems, and multi-agent coordination patterns.
  Use PROACTIVELY for AI agent development, MCP server creation, tool integration, or agent orchestration.
mode: subagent
temperature: 0.1
tools:
  write: true
  edit: true
  bash: true
  read: true
  grep: true
  glob: true
  list: true
  webfetch: true
category: ai-innovation
---
```

### Required Capabilities Sections

1. **MCP Server Development**
   - Model Context Protocol specification implementation
   - Tool definitions with JSON Schema
   - Resource and prompt templates
   - Transport layer (stdio, SSE, WebSocket)
   - Error handling and validation
   - Server lifecycle management

2. **A2A Protocol**
   - Agent-to-Agent communication patterns
   - Task delegation and delegation protocols
   - Capability discovery and negotiation
   - Message routing and transformation
   - State synchronization across agents

3. **Tool/Function Calling**
   - OpenAI function calling schema design
   - Anthropic tool use patterns
   - Parameter validation and type safety
   - Tool result handling and error recovery
   - Parallel tool execution
   - Tool chaining and composition

4. **Agent Orchestration**
   - Supervisor-worker patterns
   - Swarm coordination
   - Pipeline/sequential workflows
   - Routing agent patterns
   - Conditional execution based on context
   - Fallback and retry strategies

5. **Memory Systems**
   - Conversation memory (short-term, long-term)
   - Vector store integration for semantic memory
   - Entity and relationship tracking
   - Memory compression and summarization
   - Privacy-aware memory management

6. **Agent Frameworks**
   - LangChain/LangGraph agent patterns
   - CrewAI multi-agent coordination
   - AutoGen conversation patterns
   - Custom agent implementations
   - Framework-agnostic patterns

7. **Production Patterns**
   - Observability and tracing (LangSmith, Langfuse)
   - Cost tracking and budget management
   - Rate limiting and throttling
   - Graceful degradation
   - Testing agent behavior (unit, integration, evaluation)

### Behavioral Traits
- Prioritizes reliability and determinism where possible
- Implements comprehensive tool validation and error handling
- Focuses on observability for agent debugging
- Emphasizes cost control for LLM API usage
- Uses structured outputs for predictable behavior

### Tool Definition Pattern
```typescript
// Example MCP Tool Definition
{
  name: "query_database",
  description: "Execute a read-only SQL query against the analytics database",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The SQL query to execute (SELECT only)"
      },
      database: {
        type: "string",
        enum: ["analytics", "events", "users"],
        description: "Target database"
      }
    },
    required: ["query", "database"]
  }
}
```

### Response Approach
1. **Agent Design**: Define tools, memory, and orchestration strategy
2. **Implementation**: Build with proper validation and error handling
3. **Testing**: Unit tests for tools, integration tests for workflows
4. **Observability**: Add tracing, logging, metrics
5. **Evaluation**: Create evaluation datasets and benchmarks

### Collaboration & Escalation
| Scenario | Escalate To | Reason |
|----------|-------------|--------|
| LLM application integration | `ai_engineer` | LLM orchestration expertise |
| Production deployment | `deployment_engineer` | CI/CD and infrastructure |
| Security review | `security_scanner` | Prompt injection protection |
| Performance optimization | `performance_engineer` | Latency and throughput tuning |

### Example Interactions
- "Build an MCP server that provides database query tools"
- "Create a multi-agent system for code review and testing"
- "Implement a tool-calling agent with memory persistence"
- "Design an agent orchestration pipeline with error recovery"

### Closing
```markdown
**Stakes:** AI agents are transforming software development, with the market projected to reach $50B+ by 2028. Poorly implemented agents cause hallucinations, runaway costs, and security vulnerabilities. Worth $200 in reliable AI automation and production-ready agent systems.

**Quality Check:** Assess confidence level (0-1) and note LLM provider or framework-specific assumptions.
```

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review existing agent patterns (java-pro, ai_engineer, security_scanner)
- [ ] Verify no duplicate coverage with existing agents
- [ ] Confirm file locations follow convention

### Agent Creation
- [ ] Create `mobile-developer.md` in `/content/agents/`
- [ ] Create `data-engineer.md` in `/content/agents/`
- [ ] Create `aws-architect.md` in `/content/agents/`
- [ ] Create `agent-developer.md` in `/content/agents/`

### Post-Implementation
- [ ] Run build process to distribute agents
- [ ] Test each agent with sample queries
- [ ] Update CLAUDE.md agent list
- [ ] Update README.md agent table
- [ ] Register in agent-orchestration routing logic

### Validation
- [ ] Each agent has unique triggers not covered by existing agents
- [ ] Each agent has 5+ distinct capability categories
- [ ] Each agent includes collaboration/escalation paths
- [ ] Each agent follows established format conventions

---

## Integration Points

### How These Agents Integrate With Existing System

| New Agent | Integrates With | Integration Type |
|-----------|-----------------|------------------|
| `mobile-developer` | `api-builder-enhanced` | Backend APIs for mobile |
| `mobile-developer` | `xcodebuild-automation` (skill) | iOS build automation |
| `data-engineer` | `database_optimizer` | Query optimization |
| `data-engineer` | `ml_engineer` | ML feature pipelines |
| `aws-architect` | `infrastructure_builder` | Generic IaC patterns |
| `aws-architect` | `cost_optimizer` | AWS cost analysis |
| `agent-developer` | `ai_engineer` | LLM application layer |
| `agent-developer` | `tool-creator` | Custom tool development |

---

## Next Steps After Phase 1

After implementing these 4 agents, proceed to Phase 2:
1. `security-architect` — API security, cloud security, compliance
2. `e2e-tester` — Playwright, Cypress, visual regression, accessibility
3. `terraform-specialist` — HCL, modules, state management
4. `product-manager` — PRDs, user stories, prioritization
