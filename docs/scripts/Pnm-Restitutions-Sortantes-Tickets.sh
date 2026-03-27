#!/bin/bash
#-----------------------------------------------------------------------#
#		Pnm-Restitutions-Sortantes-Tickets.sh			#
#-----------------------------------------------------------------------#
# Author : 	  David AYMERIC david.aymeric@digicelgroup.fr		#
# Last modified :							#
# Version : 	  1.0							#
# Date : 	  07/02/2013						#
#-----------------------------------------------------------------------#
# History of versions :							#
#	- v1.0 07/02/2013 : Creation of the scrip			#
#-----------------------------------------------------------------------#
# Purpose :								#
#    Manage Restitutions Sortantes process 	 			# 
#    part ticket creation (3400) in PortaDB: 				#
# Description :								#
# 	1) Extract msisdn to be reinstituted from MOBI DB 		#
#   	2) For each msisdn Call Porta Ws OP CreatePortaRestitution 	#
#-----------------------------------------------------------------------#
# Scheduling :								#
#   run every monday at 06h00 via /etc/crontab with porta_pnmv3 user	#
#-----------------------------------------------------------------------#

echo "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
echo "||||||| BEGIN OF SCRIPT $0 - `date` |||||||||"
echo "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
echo " "

# **********************************************************************#
# Set Variables
# **********************************************************************#

# Porta web service URL
WS_server=172.24.119.72
WS_port=8080
WS_endpoint=PortaWs/DigicelFwiPortaWs4Esb
Ws_soapAction=urn:CreatePortaRestitution

# Client Oracle MOBI (Production DB)
ORACLE_SID='MCST50A.BTC.COM'
DB_USER='pb'
DB_PASSWD='gaston'

# Load environment variables of porta user for Oracle Client
. ~/.profile

# working files
soapRequestFile=~/Resultats/CreatePortaRestitution_Request.xml
mobi_extract_restitutions_sortantes_sql=~/Sql/MOBI-Extract-Restitutions_Sortantes.sql
mobi_extract_restitutions_sortantes_resultat=~/Resultats/MOBI_Extract_Restitutions.txt
mobi_update_restitutions_sortantes_sql=~/Sql/MOBI-Update-Restitutions_Sortantes.sql

# **********************************************************************#
# Compute portage dates
# **********************************************************************#

##### Compute date demande ##### 
##### date demande = today or next working day if today is a ferry day

# initialize date_demande=today
date_demande=`date +%F`

# loop until date portage is a working day - which means until date is not saturday and not sunday and not a ferryday from PortaDB 
while [ `date --date $date_demande +%u` -gt 5 ] || [ `mysql -N -e "SELECT COUNT(*) FROM PortaDB.FERRYDAY where ferryday='$date_demande' and is_active=1;"` -ge 1 ]
do
        # add 1 day to date_demande
        date_demande=`date --date "$date_demande 1 days" +%F`
done

##### Compute date portage #####
##### date portage = date demande + 4 days working days

# initialize date_portage=date demande + 4 days 
date_portage=`date --date "$date_demande 4 days" +%F`

# loop until date portage is a working day - which means until date is not saturday and not sunday and not a ferryday from PortaDB 
while [ `date --date $date_portage +%u` -gt 5 ] || [ `mysql -N -e "SELECT COUNT(*) FROM PortaDB.FERRYDAY where ferryday='$date_portage' and is_active=1;"` -ge 1 ]
do
	# add 1 day to date_portage
       	date_portage=`date --date "$date_portage 1 days" +%F`
done

##### Add time to dates in order to comply format YYYYmmddTHH:MM:SS
date_demande=$date_demande'T10:00:00'
date_portage=$date_portage'T00:00:00'

# *********************************************************************#
# Extract msisdn to be reinstitued from MOBI DB
# *********************************************************************#

echo "	---------------------------------------------------------------"
echo "	-----   Extract msisdn to be reinstituted from MOBI DB  -------"
echo "	---------------------------------------------------------------"
echo " "

# Sql request on MOBI DB 
# and delete empty lines, spaces and tabulations from outpute file (should be managed in PL SQL request...):
cat $mobi_extract_restitutions_sortantes_sql | sqlplus -s $DB_USER/$DB_PASSWD@$ORACLE_SID | sed '/^$/d' | sed -e 's/ //g' |  sed -e 's/\t//g' > $mobi_extract_restitutions_sortantes_resultat

# Nb lines extracted 
nb_lines=`wc -l $mobi_extract_restitutions_sortantes_resultat | cut -f1 -d' '`

echo "		Nombre de lignes a traiter : $nb_lines"
echo " "

# *********************************************************************#
# For each msisdn - Call Porta Ws operation CreatePortaRestitution  
# *********************************************************************#

echo "	---------------------------------------------------------------"
echo "	--------   Call Porta Ws OP CreatePortaRestitution   ----------"
echo "	---------------------------------------------------------------"
echo " "

# **********************************
# Repeat for each Msisdn           *
# **********************************

i=1
while [ $i -le $nb_lines ]
do
        # *************************
        # Build work variables    *
        # *************************

	# compute msisdn line i 
	msisdn=`sed -n "${i}p" $mobi_extract_restitutions_sortantes_resultat | cut -d";" -f1`
	
	#compute OPA line i
	opa=`sed -n "${i}p" $mobi_extract_restitutions_sortantes_resultat | cut -d";" -f2`

	# convert OPA MOBI into OPA Porta
	case $opa in 
		
		# Orange
		"211" | "215" | "217")
			opa=01
		;;
     		# Dauphin
                "212")
                        opa=04
                ;;
				# OMT
                "213" | "216" | "218")
                        opa=03
                ;;
					# UTS
                "214")
                        opa=05
                ;;
						# FREE
                "219" | "220" | "221")
                        opa=06
                ;;
	esac

	# compute ancienIdPortage line i

	# Update operateur_id_actuel with the value 2 (Digicel) before initializing restitution
	mysql -N -e "UPDATE PortaDB.MSISDN SET PortaDB.MSISDN.operateur_id_actuel = '2' WHERE PortaDB.MSISDN.msisdn=$msisdn;"
	
	# Search first in PNMV3 
	if [ `mysql -N -e "SELECT COUNT(*) FROM PortaDB.PORTAGE where msisdn=$msisdn;"` -gt 0 ] 
	then
 		# portage exist in PNMV3  - retrieve ancienIdportage (keep only the last portage which is the max_ID)
		ancienIdPortage=`mysql -N -e "SELECT id_portage FROM PortaDB.PORTAGE WHERE msisdn='$msisdn' and date_fin = (SELECT MAX(date_fin) FROM PortaDB.PORTAGE WHERE msisdn='$msisdn');"`
	
	# Search in POM V2
	elif [ `mysql -N -e "SELECT COUNT(*) FROM PortaDB.HIST_POM_PORTAGE where msisdn=$msisdn;"` -gt 0 ]
	then
		# portage exist in POM pnmv2 - retrieve ancienIdportage (keep only the last portage which is the max MSI_ID)
                ancienIdPortage=`mysql -N -e "SELECT id_portage FROM PortaDB.HIST_POM_PORTAGE WHERE msisdn='$msisdn' and date_portage = (SELECT MAX(date_portage) FROM PortaDB.HIST_POM_PORTAGE WHERE msisdn='$msisdn');"`

	# If no entry in PNMV3 and PNMV2 so set a defautl value
	else
		# portage does not exist in POM pnmv2 - default ancienIdportage
		ancienIdPortage='62b6c108bea0c972d0bbace581beb924'
	fi

	# *************************
	# Create XML Request File *
	# *************************

	# clear soapRequestFile
	echo " " > $soapRequestFile
	# add soap envelope
	echo '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:por="http://service.digicel.fr/porta/">' >> $soapRequestFile
	echo "	<soapenv:Header/>" >> $soapRequestFile
	echo "	<soapenv:Body>" >> $soapRequestFile
	echo "		<por:CreatePortaRestitutionInput>" >> $soapRequestFile
	echo "			<por:opa>$opa</por:opa>" >> $soapRequestFile
	echo "	 		<por:msisdn>$msisdn</por:msisdn>" >> $soapRequestFile
	echo "			<por:dateDemande>$date_demande</por:dateDemande>" >> $soapRequestFile
	echo "			<por:datePortage>$date_portage</por:datePortage>" >> $soapRequestFile
	echo "			<por:ancienIdPortage>$ancienIdPortage</por:ancienIdPortage>" >> $soapRequestFile
#	echo "			<por:ancienIdPortageMultiple> non renseigne </por:ancienIdPortageMultiple>" >> $soapRequestFile
	echo "			<por:commentaire>RESTITUTION</por:commentaire>" >> $soapRequestFile
	echo "		</por:CreatePortaRestitutionInput>" >> $soapRequestFile
	echo "	</soapenv:Body>" >> $soapRequestFile
	echo "</soapenv:Envelope>" >> $soapRequestFile
	
	# *******************
	# Perform soap call *
	# *******************
	echo "	Soap Call number $i for msisdn $msisdn : "
	echo "	------------------------------------------" 
	curl -H "Content-Type: text/xml; charset=utf-8" -H "SOAPAction:$WS_soapAction" -d @$soapRequestFile -X POST http://$WS_server:$WS_port/$WS_endpoint
	echo " "
	echo " "
	
	### go to next ligne
	let i=$((i+1))
done

echo " "
echo "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
echo "||||||| END OF SCRIPT $0 - `date` |||||||||"
echo "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
echo " "
