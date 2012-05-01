#!/usr/bin/env sh

############ BUGSWARM SERVER DEPLOYMENT SCRIPT ################
## This scripts makes the deployment of comcast.buglabs.net  ##
##                                                           ##
## camilo@buglabs.net                                        ##
###############################################################

set -o errexit
set -o nounset

abort() {
    echo "✗ $@" && exit 1
}

if [ "$(id -u)" != "0" ]; then
    abort "This script must be run as root."
fi

PROJECT=${1}
BRANCH=${2}
ENVIRONMENT=${3}
DOMAIN=${4}

DEPLOYDIR=/var/www/buglabs
PROJECTDIR=$DEPLOYDIR/$PROJECT

RELEASES=$PROJECTDIR/releases
RELEASE=$RELEASES/$BRANCH

SNAPSHOTS=$PROJECTDIR/snapshots
SNAPSHOT=$SNAPSHOTS/`date "+%Y%m%d%H%M"`


log() {
    echo "... $@"
}

ok() {
    echo "✓ $@"
}

deploy() {
    [ -d $RELEASES ] || mkdir -p $RELEASES
    [ -d $SNAPSHOTS ] || mkdir -p $SNAPSHOTS

    git clone -b $BRANCH git@github.com:chipkit/$PROJECT.git $SNAPSHOT

    cd $SNAPSHOT && git submodule update --init && make install && chmod 755 server.js

    #links snapshot with release
    [ -e $RELEASE ] && unlink $RELEASE
    ln -s $SNAPSHOT $RELEASE

    ok "$PROJECT has been installed in the $ENVIRONMENT environment and linked to $RELEASE release."
}

copy_cfg_files() {
    local basedir="$SNAPSHOT/scripts"

    cp $basedir/$PROJECT.conf /etc/init/

    sed -i "s|%%ENVIRONMENT%%|$ENVIRONMENT|g" /etc/init/$PROJECT.conf
    sed -i "s|%%RELEASE%%|$RELEASE|g" /etc/init/$PROJECT.conf

    ok "Configuration files copied from $SNAPSHOT"
}

restart_services() {
    local started=''

    service $PROJECT stop
    service $PROJECT start

    status $PROJECT | grep -q 'start/running' && started='1'

    if [ -n "$started" ]; then
        ok "Service $PROJECT started"
    else
        abort "Service $PROJECT did not start successfully"
    fi
}

deploy
copy_cfg_files
set +e
restart_services

ok "$PROJECT installed successfuly"

