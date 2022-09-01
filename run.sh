#!/bin/bash
export NODE_ENV=production
export DEBUG=main*

pm2 start --name three-loans --time