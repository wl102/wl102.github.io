---
layout: post
title: "Bloom Fitter Example"
date:   2024-09-21 14:00:00 +0800
categories: design
---

**概念**

布隆过滤器（Bloom Filter）是一种高效的概率型数据结构，用于快速判断某个元素是否存在于一个集合中。
- 概率型：布隆过滤器可能会误判，即报告某个元素在集合中存在（假阳性），但绝对不会漏判（假阴性）。
- 内存效率：布隆过滤器在存储和查询操作上非常节省内存，适合用于大规模数据集。

**基本原理**

- 布隆过滤器使用一个位数组（bit array）和多个哈希函数。
- 当插入一个元素时，通过多个哈希函数计算出该元素的哈希值，并将位数组中对应的位置置为1。
- 查询一个元素时，使用同样的哈希函数计算哈希值，检查位数组中对应的位置。如果所有对应的位置都是1，则该元素可能存在；如果有任何一个位置是0，则该元素一定不存在。

**实际应用**

实际工作中的应用，开发威胁情报查询需求时，用于快速判断ip、url、域名等是否在恶意库表中，减少不必要的查询，降低数据库的IO压力

**示例代码**

[bloom example](https://github.com/wl102/bloom_example)