#!/bin/bash
set -e

#查看mysql服务的状态，方便调试，这条语句可以删除
# echo `service mysql status`

echo '正在初始化环境...'
service mysql start > /dev/null 2>&1

#导入数据
mysql < /mysql/schema.sql > /dev/null 2>&1

#重新设置mysql密码
# echo '4.开始修改密码....'
# mysql < /mysql/privileges.sql
# echo '5.修改密码完毕....'

