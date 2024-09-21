---
layout: post
title: "Socket: too many open files"
date:   2024-09-14 10:00:00 +0800
categories: linux
---

### 1. 故障描述

出现该问题是因为应用程序打开的操作系统文件描述符（OS File Descriptor）超出了某些系统限制。

### 2. 查询系统open files的限制
可以通过命令 ulimit -a查看当前系统文件描述符的限制大小

```bash
[root@Sin xxx]$ ulimit -a
core file size          (blocks, -c) 0
data seg size           (kbytes, -d) unlimited
scheduling priority             (-e) 0
file size               (blocks, -f) unlimited
pending signals                 (-i) 512391
max locked memory       (kbytes, -l) 64
max memory size         (kbytes, -m) unlimited
open files                      (-n) 1024
pipe size            (512 bytes, -p) 8
POSIX message queues     (bytes, -q) 819200
real-time priority              (-r) 0
stack size              (kbytes, -s) 8192
cpu time               (seconds, -t) unlimited
max user processes              (-u) 512391
virtual memory          (kbytes, -v) unlimited
file locks                      (-x) unlimited
```

增加open files的限制大小

```bash
[root@Sin xxx]$ ulimit -n 65535
```

检查open files的限制大小

```bash
[root@Sin xxx]$ ulimit -a
core file size          (blocks, -c) 0
data seg size           (kbytes, -d) unlimited
scheduling priority             (-e) 0
file size               (blocks, -f) unlimited
pending signals                 (-i) 512391
max locked memory       (kbytes, -l) 64
max memory size         (kbytes, -m) unlimited
open files                      (-n) 65535
pipe size            (512 bytes, -p) 8
POSIX message queues     (bytes, -q) 819200
real-time priority              (-r) 0
stack size              (kbytes, -s) 8192
cpu time               (seconds, -t) unlimited
max user processes              (-u) 512391
virtual memory          (kbytes, -v) unlimited
file locks                      (-x) unlimited
```
可以看到系统open files的限制已经增加到了65535，重启服务，一切ok。

但是，接下来的两天系统还是经常抛出 ‘too many open files’ error。

### 3. 最终解决方法以及问题原因
通过前面的排查，我们已经确定ulimit -n 65535的限制大小是能够满足当前系统的需要，lsof -p [pid] | wc -l 的统计结果远远小于这个值，也能验证这一点。

为什么还会频繁出现呢？

后续经过对比发现我们的后端服务是通过systemd 进行管理的，通过google 'ulimit systemd'很快有了发现。

原来，使用systemd管理服务，它有自己的方法来管理相关配置，只需要我们在 .service文件配置下即可，下面是配置过程：

```bash
[root@Sin system]$ cd /etc/systemd/system/
[root@Sin system]$ vi my_service.service
```

在[Service]块内添加两行内容

```text
[Service]
 ...
 LimitNPROC=65535
 LimitNOFILE=65535
 ...
```

保存之后，执行“sudo systemctl daemon-reload”和“sudo systemctl restart your-app”来应用新的配置。

重启服务之后，观察接下来几天的后台日志，没有出现too many open files的故障，说明问题得到了解决。

### 4. 总结
Linux系统中默认的open files是1024，对于许多大型应用来说是远远不够的。针对‘too many files’的问题，首先应该适当增加系统ulimit的大小（可能需要在多个地方配置），其次应该关注服务tcp连接泄露的问题。

此次故障排查的大致流程：

首先想到的是通过lsof命令统计服进程打开的文件描述符的数量。

duplicate 服务负载比较高的状态：

```bash
[root@Sin ~]# lsof -p 40749 | wc -l
1590
```

后端服务进程打开的文件描述符大概1600左右，超出了1024的默认限制。



### 5. 参考链接
[1] https://coding-stream-of-consciousness.com/2018/12/21/centos7-and-rhel7-increasing-open-file-descriptors-process-limits/

[2] https://stackoverflow.com/questions/34588/how-do-i-change-the-number-of-open-files-limit-in-linux

[3] https://access.redhat.com/solutions/61334

