#!/usr/bin/bash

function processDir(){
	#$1
	cd $1
	echo "Processing $1 ... "
	for item in `ls`
	do
		echo $item
		if [ -d $item ];then
			processDir $item
		fi
		if [ -w $item ] && [ "${item##*.}"x = "wxss"x ];then
			echo "Change $item: wxss => css "
			sed -i 's/wxss/css/g' $item
			echo Move $item to ${item%.*}.css
			mv "$item" "${item%.*}.css"
		elif [ -w $item ] && [ "${item##*.}"x = "wxml"x ];then
			echo "Change $item: wx:for => s-for "
			sed -i 's/wx:for/s-for/g' $item
			echo "Change $item: wx:for-index => s-for-index "
			sed -i 's/wx:for-index/s-for-index/g' $item
			echo "Change $item: wx:for-item => s-for-item "
			sed -i 's/wx:for-item/s-for-item/g' $item
			echo "Change $item: remove wx:key=\"\*this\" "
			sed -i 's/ wx:key=\"\*this\"/ /g' $item
			echo "Change $item: wx:if => s-if "
			sed -i 's/wx:if/s-if/g' $item
			echo "Change $item: wx:else => s-else "
			sed -i 's/wx:else/s-else/g' $item
			echo Move $item to ${item%.*}.swan
			mv "$item" "${item%.*}.swan"
		elif [ -w $item ] && [ "${item##*.}"x = "js"x ];then
			echo "Change $item: wx. => swan. "
			sed -i 's/wx\./swan\./g' $item
		fi
	done
	if [ "$1"x != ".x" ];then
		cd ..
	fi
}

if [ ! -f "app.js" ];then
	echo 'Error: not in applet home directory.'
	exit
fi

#mv app.wxss app.css
mv project.config.json project.swan.json

processDir .


