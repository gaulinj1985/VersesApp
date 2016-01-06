####################################
#
# Bundle Verses
#
# List prerouting tables
# sudo iptables -L -vt nat 
#
# Adding port forwarding
# iptables -A INPUT -i eth0 -p tcp --dport 80 -j ACCEPT
# iptables -A INPUT -i eth0 -p tcp --dport 8080 -j ACCEPT
# iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080
# NOT THIS ONE # iptables -t nat -A OUTPUT -p tcp --dport 80 -j REDIRECT --to-port 8080
####################################

# Remove Bundle folder. 
#sudo rm -rf bundle

# Remove Bundle tgz. 
sudo rm -rf ../bundle.tgz
echo "Items removed"

#Git pull files
#git pull

# Bundle site
echo "Bundling..."
sudo meteor bundle ../bundle.tgz
echo "Bundling complete"


