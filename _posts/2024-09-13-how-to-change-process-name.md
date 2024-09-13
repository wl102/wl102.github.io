---
layout: post
title:  "How to change process name"
date:   2024-09-13 16:00:00 +0800
categories: security
---
基于prctl的系统调用修改在/proc/pid/status中的进程名称，实现进程名称的伪装。

下面是Go程序实例:

```go

import (
	"fmt"
	"log"
	"os"
	"os/signal"

	prctl "github.com/wl102/go-prctl"
)

func main() {
	prName := "sshd"
	// make sure first running
	err := prctl.SetProcessName(prName)
	if err != nil {
		log.Println(err)
	}

	wait := make(chan os.Signal, 1)
	signal.Notify(wait, os.Interrupt)

	name, err := prctl.GetProcessName()
	if err != nil {
		log.Println(err)
	} else {
		fmt.Println(name)
	}

	<-wait
	fmt.Println("exit.")
}
```