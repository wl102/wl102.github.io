---
layout: post
title: "Gracefully exit in Go"
date:   2024-09-14 15:00:00 +0800
categories: linux
---

本文给出了如何优雅处理Go程序退出的例子（仅供参考）

```go
package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	wait := make(chan os.Signal, 1)
    // note: the SIGKILL can't be captured
	signals := []os.Signal{syscall.SIGINT, syscall.SIGTERM}
	signal.Notify(wait, signals...)
	<-wait
	fmt.Println("normally exit.")
}
```

实验结果：
```bash
# output
$ kill -2 pid
normally exit.
$ kill -15 pid
normally exit.
$ kill -9 pid
Killed
```
