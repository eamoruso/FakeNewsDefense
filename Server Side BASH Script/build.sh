#!/bin/bash
# -----------------------------------------
# Written by Edward Amoruso @ UCF.EDU     #
# Version 3.2.1                           #
#                                         #
# Purpose:                                #
#  Script that creates the required XML   #
#  file for corresponding image utilized  #
#  by the Fake News Server side hosting.  #
#                                         #
# -----------------------------------------

# Check passed parameters
#
if [ "$1" == "" ]
then
    echo "Usage: build <image_file> <private-key> <public-key>"
else
    echo "------------------------------------------------------"
    echo I\'m getting things ready, please wait...
    echo "------------------------------------------------------"
    # Assign file names with image name prefix and extension
    #
    FILE_NAME=$1
    FILE_PRIVATE_KEY=$2
    FILE_NAME_X509=$3
    FILE_NAME_XML=$1".xml"
    FILE_NAME_H=$1".H"
    FILE_NAME_BASE64=$1".base64"
    FILE_NAME_DIGEST=$1".digest"
    FILE_NAME_SIGNED=$1".signed"
    FILE_NAME_SIGNATURE=$1".signature"
    FILE_NAME_TEMP=$1".temp"

    # Check to see if temp files exhist
    #
    if [[ -f $FILE_NAME_H ]]
    then
        # Delete Temp files
        rm $FILE_NAME_XML
        rm $FILE_NAME_H
        rm $FILE_NAME_BASE64
        rm $FILE_NAME_DIGEST
        rm $FILE_NAME_SIGNED
        rm $FILE_NAME_SIGNATURE
	rm $FILE_NAME_TEMP
    fi

    # Specify the private key to use in digital signature
    #
    if [[ -f $FILE_PRIVATE_KEY ]]
    then
        echo -n "Using the following private-key to sign digest: "
        echo $FILE_PRIVATE_KEY
    else
        echo "Private-Key File Missing..."
        exit 0
    fi

    # Specify the Public Key X509 for the XMP file
    #
    if [[ -f $FILE_NAME_X509 ]]
    then
        echo -n "Attaching the following Public-key to XML file: "
        echo $FILE_NAME_X509
    else
        echo "Public-Key File Missing..."
        exit 0
    fi
    # Prompt User for XMP content needed for image_file
    #
    echo "------------------------------------------------------"
    echo " Please answer the following questions "
    echo "------------------------------------------------------"
	echo -n "News Item Headline: "
	read -r
	NewsItemHeadline=$REPLY
	echo -n "News Item Description: "
	read -r
	NewsItemDescription=$REPLY
    echo -n "News Item Creator's Name: "
    read -r
    CreatorName=$REPLY
    echo -n "Content Creation Date (YYYY-MM-DD): "
    read -r
    ContentDate=$REPLY
    echo "Please enter Content Creation Time HH:MM:SS(+OR-)TZ:00 (TZ=TIMEZONE)"
    echo "   example: 21:01:20-04:00 where -04:00 is eastern time zone"
    echo -n ": "
    read -r
    ContentTime=$REPLY
	echo -n "News Item City: "
    read -r
    LocationCity=$REPLY
	echo -n "News Item Region (e.g., State): "
    read -r
    LocationRegion=$REPLY
	echo -n "News Item Country: "
    read -r
    LocationCountry=$REPLY

    # Create FILE_NAME_H file to use for getting hash user entry values of
    # above information (e.g., Date,City,Region,Country,Description, etc...)
    #
    echo Creating H-File - $FILE_NAME_H
    echo -n $ContentDate > $FILE_NAME_H
    echo -n 'T' >> $FILE_NAME_H
    echo -n $ContentTime >> $FILE_NAME_H
    echo -n $LocationCity >> $FILE_NAME_H
    echo -n $LocationRegion >> $FILE_NAME_H
    echo -n $LocationCountry >> $FILE_NAME_H
    echo -n $CreatorName >> $FILE_NAME_H
    echo -n $NewsItemHeadline >> $FILE_NAME_H
    echo -n $NewsItemDescription >> $FILE_NAME_H

    # copy (merge) certificate x509 contents to H-File
    #
	echo Merging X509 to file - $FILE_NAME_X509
	awk 'NF {sub(/\r/, ""); printf "%s",$0;}' $FILE_NAME_X509 > $FILE_NAME_TEMP
	cat $FILE_NAME_TEMP >> $FILE_NAME_H

    # create base64 file for the news item image binary
    #
	echo Creating base64 file - $FILE_NAME_BASE64
	base64 --wrap=0 $1 > $FILE_NAME_BASE64

    # merge contents of image-base64 with H-File (needed for hash)
    #
    echo Merging H-File to base64 image file...
	cat $FILE_NAME_BASE64 >> $FILE_NAME_H

	# create sha256 of image + MetaData file
	echo Creating sha256 digest file - $FILE_NAME_DIGEST
	openssl dgst -r -sha256 $FILE_NAME_H | grep -o '^\S*' > $FILE_NAME_DIGEST

	# Create signed file for H(m)
    #
	echo Creating Signed file from sha256 digest file - $FILE_NAME_SIGNED
	openssl dgst -sha256 -sign $FILE_PRIVATE_KEY -out $FILE_NAME_SIGNED $FILE_NAME_DIGEST

    # Convert to base64 to include in XML as signature
	#
    openssl base64 -in $FILE_NAME_SIGNED -out $FILE_NAME_SIGNATURE
	echo "------------ H(m) Digest  -------------"
	cat $FILE_NAME_DIGEST
	echo
	echo "----- Signed Digest (signature) -------"
	cat $FILE_NAME_SIGNATURE
	echo 
    # Start creating XML file with gathered information
    #
    echo '<?xml version="1.0" encoding="UTF-8"?>' > $FILE_NAME_XML
    echo '<xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.6-c148 79.163820, 2019/02/20-18:54:02">' >> $FILE_NAME_XML
    echo ' <RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">' >> $FILE_NAME_XML
    echo '  <NewsItemDescription rdf:about="'$NewsItemHeadline'">' >> $FILE_NAME_XML
    echo '   <newsItem xml:lang="en-US">' >> $FILE_NAME_XML
    echo '    <catalogRef href="http://www.iptc.org/std/catalog/catalog.IPTC-G2-Standards_32.xml"/>' >> $FILE_NAME_XML
    echo '     <contentMeta>' >> $FILE_NAME_XML
    echo '      <contentCreated>'$ContentDate'T'$ContentTime'</contentCreated>' >> $FILE_NAME_XML
    echo '      <location>' >> $FILE_NAME_XML
    echo '        <city>'$LocationCity'</city>' >> $FILE_NAME_XML
    echo '        <region>'$LocationRegion'</region>' >> $FILE_NAME_XML
    echo '        <country>'$LocationCountry'</country>' >> $FILE_NAME_XML
    echo '      </location>' >> $FILE_NAME_XML
    echo '      <creator role="crol:photographer">' >> $FILE_NAME_XML
    echo '        <name>'$CreatorName'</name>' >> $FILE_NAME_XML
    echo '      </creator>' >> $FILE_NAME_XML
    echo '      <creditline>UCF Fake News</creditline>' >> $FILE_NAME_XML
    echo '      <headline>'$NewsItemHeadline'</headline>' >> $FILE_NAME_XML
    echo '      <description>'$NewsItemDescription'</description>' >> $FILE_NAME_XML
    echo '     </contentMeta>' >> $FILE_NAME_XML
    echo '    <contentSet>' >> $FILE_NAME_XML
    echo '     <remoteContent>' >> $FILE_NAME_XML
    echo '      <hash type="SHA-2"></hash>' >> $FILE_NAME_XML
    echo '     </remoteContent>' >> $FILE_NAME_XML
    echo '    </contentSet>' >> $FILE_NAME_XML
    echo '   </newsItem>' >> $FILE_NAME_XML
    echo '   <Signature>' >> $FILE_NAME_XML
    echo '    <SignedInfo>' >> $FILE_NAME_XML
    echo '     <DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/>' >> $FILE_NAME_XML
    echo -n '     <DigestValue>' >> $FILE_NAME_XML
    while read DigestValue; do echo -n "$DigestValue"; done < $FILE_NAME_DIGEST >> $FILE_NAME_XML
    echo '</DigestValue>' >> $FILE_NAME_XML
    echo '    </SignedInfo>' >> $FILE_NAME_XML
    echo -n '    <SignatureValue>' >> $FILE_NAME_XML
    while read SignatureValue; do echo -n "$SignatureValue"; done < $FILE_NAME_SIGNATURE >> $FILE_NAME_XML
    echo '</SignatureValue>' >> $FILE_NAME_XML
    echo '    <KeyInfo>' >> $FILE_NAME_XML
    echo '     <KeyValue>' >> $FILE_NAME_XML
    echo '      <RSAKeyValue>' >> $FILE_NAME_XML
    echo '       <Modulus></Modulus>' >> $FILE_NAME_XML
    echo '       <Exponent></Exponent>' >> $FILE_NAME_XML
    echo '      </RSAKeyValue>' >> $FILE_NAME_XML
    echo '     </KeyValue>' >> $FILE_NAME_XML
    echo '     <X509Data>' >> $FILE_NAME_XML
    echo -n '      <X509Certificate>' >> $FILE_NAME_XML
    while read X509Certificate; do echo -n "$X509Certificate"; done < $FILE_NAME_X509 >> $FILE_NAME_XML
    echo '</X509Certificate>' >> $FILE_NAME_XML
    echo '     </X509Data>' >> $FILE_NAME_XML
    echo '    </KeyInfo>' >> $FILE_NAME_XML
    echo '   </Signature>' >> $FILE_NAME_XML
    echo '  </NewsItemDescription>' >> $FILE_NAME_XML
    echo ' </RDF>' >> $FILE_NAME_XML
    echo '</xmpmeta>' >> $FILE_NAME_XML
    # --- End of XMP File ---
fi
