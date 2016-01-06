####################################
#
# Deploy Verses
#
####################################

#start mongo as a daemon
#sudo mongod --fork --logpath /var/log/mongod.log --smallfiles

# Deploy server
sudo PORT=8000 MONGO_URL=mongodb://172.31.44.14:27017/verses ROOT_URL=http://joinverses.com nohup node bundle/main.js &