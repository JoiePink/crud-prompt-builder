# Skills 共享片段（02/03/04）

> 用途：沉淀高频固定文案，降低多 Skill 重复维护成本。  
> 约束：场景 Skill 引用本文件时，只保留“场景特有增量”，不复制整段通用文案。

## S1：缺参处理模板（先问再生成）

- [MUST] 涉及关键参数缺失时，先追问再生成代码，不得猜测默认值。
- [MUST] 追问项仅列“最小必填参数”，避免一次性过度追问。
- [SHOULD] 追问后提供可填写模板，帮助用户一次性补齐参数。

## S2：提交前检查继承声明模板

- [MUST] 场景 Skill 的“提交前检查”必须继承并执行 `../01-project-conventions/SKILL.md` 中“提交前检查（通用）”清单；通用清单更新时，以入口 Skill 为准，不在场景 Skill 复制同内容副本。

## S3：30 秒上手说明模板

> 用途：首次接入时可直接复制，快速跑通该场景主链路。  
> 注意：关键参数缺失时，执行 `S1`（先问再生成），不得猜测。

## S4：框架依赖声明模板（入口优先）

- [MUST] 本套 Skill 约定基于 `Ruoyi-Plus-Vue + Vue 3 + TypeScript + Element Plus` 项目形态。
- [MUST] 本套 Skill 默认依赖以下既有封装：`@/utils/request`、`@/plugins/modal.ts`、`@/plugins/auth.ts`、`@/plugins/cache.ts`、`globalHeaders()`、`proxy.download/$download`、`proxy?.reconstructDateRange`。
- [MUST] 若目标仓库不具备上述封装或框架差异明显，应先与用户确认“映射关系/替代方案”，再生成代码；不得直接套用导致不可运行代码。

## S5：30 秒上手“场景增量”写法模板

> 写法约定：`> 本场景必填增量：xxx（缺失时按 S1 先追问）。`
> 说明：场景 Skill 的“30 秒上手”仅写本场景增量，不重复通用提醒。
