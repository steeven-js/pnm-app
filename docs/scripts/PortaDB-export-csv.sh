#!/bin/bash
# ----------------------------------------------------------------------#
#			PortaDB-export-csv.sh				#
# ----------------------------------------------------------------------#
# Author : 	  David AYMERIC david.aymeric@digicelgroup.fr		#
# Last modified :							#
# Version : 	  1.0							#
# Date : 	  21/12/2012						#
# ----------------------------------------------------------------------#
# History of versions :							#
#	- v1.0 21/12/2012 : Creation of the scrip			#
#	- v1.1 11/01/2013 : Modif : Do not export all PortaDB tables	#
#			    but only functionnal tables needed for MIS	#
# ----------------------------------------------------------------------#
# Purpose :								#
# 	Export tables from DataBase PortaDB to EMM server for MIS needs	#
#   	Create one csv file per table and copy it on EMM Server		#
# ----------------------------------------------------------------------#
# Scheduling :								#
#    Every day (1 to 7) at 00:00 via /etc/crontab with porta_pnmv3 user	#
# ----------------------------------------------------------------------#
# To do									# 
#	- Tuning for better Performances :				#
#		- use 'for do ssh' insted of 'ssh for do'		#
#		in order to connect only once to the remote server	#
#		- archive before scp and then ssh unarchive		#
# ----------------------------------------------------------------------#

# Variables
date=`date +%Y%m%d`
PortaWebdb01_export_directory=/home/porta_pnmv3/Export/csv
#OLD_EMM_server=172.24.27.136
#OLD_EMM_directory=/var/opt/BGw/ServerGroup1/Server1/DIGICEL/input/PORTA
EMM_server=172.24.27.144
EMM_user=pnm
EMM_directory=/mediation/DIGICEL/input/PORTA/


#Old v1.0 : retrieve all tales from PortaDB     PortaDB_Tables=`mysql -e "show tables from PortaDB;" | sed '1d'`

# List functionnal tables from PortaDB to be exported
PortaDB_Tables[0]='ACK'
PortaDB_Tables[1]='CODE_REPONSE'
PortaDB_Tables[2]='CODE_TICKET'
PortaDB_Tables[3]='DATA'
PortaDB_Tables[4]='DOSSIER'
PortaDB_Tables[5]='ETAT'
PortaDB_Tables[6]='FERRYDAY'
PortaDB_Tables[7]='FICHIER'
PortaDB_Tables[8]='MSISDN'
PortaDB_Tables[9]='MSISDN_HISTORIQUE'
PortaDB_Tables[10]='OPERATEUR'
PortaDB_Tables[11]='PORTAGE'
PortaDB_Tables[12]='PORTAGE_DATA'
PortaDB_Tables[13]='PORTAGE_HISTORIQUE'
#PortaDB_Tables[14]='SYNC'
#PortaDB_Tables[15]='SYNC_STATUS'
PortaDB_Tables[16]='TRANCHE'
PortaDB_Tables[17]='TRANSITION'

# Computing 
echo " "
echo "########## BEGIN OF SCRIPT PortaDB-export-csv.sh - `date` ##########"

echo " "
echo "	=== Export PortaDB tables from mysql into csv directory ==="
echo " "
	# Loop on PortaDB Tables 
	for table in ${PortaDB_Tables[*]};do
		echo "		|| Table : $table ||";
		echo "			- Export table from mysql into csv file -";
		# export table mysql into csv.tmp file
		mysql -e "SELECT * FROM PortaDB.$table;" | sed -e 's/\t/;/g' | sed -e 's/NULL//g' -e 's/$/;/g' > $PortaWebdb01_export_directory/export-PortaDB-${table}-$date.csv.tmp
	done

echo " "
echo "	=== Csv files created in directory : $PortaWebdb01_export_directory ==="
echo " "
	# List csv directory
	ls -lrth $PortaWebdb01_export_directory

echo " "
echo "	=== Transfert files on EMM serveur directory : $EMM_directory ==="
echo " "
	echo "	- Copy all csv.tmp files on EMM Server  -";
	# copy all csv.tmp files from PortaWebdb to EMM
	scp  $PortaWebdb01_export_directory/*.csv.tmp $EMM_user@$EMM_server:$EMM_directory/.
	
	echo " "
	echo "	- Rename each csv.tmp file into csv on EMM Server...It might take several minutes...  -";
	#  after copy completed connect on EMM Server and renamme each file from 'csv.tmp' to '.csv'
	for table in ${PortaDB_Tables[*]}
	do
		ssh $EMM_user@$EMM_server mv ${EMM_directory}/export-PortaDB-${table}-${date}.csv.tmp ${EMM_directory}/export-PortaDB-${table}-${date}.csv
	done
	
echo " "
echo "	=== Remove csv files From PortaWebdb01 directory : $PortaWebdb01_export_directory ==="
echo " "        
	rm -v $PortaWebdb01_export_directory/export-PortaDB-*.csv.tmp

echo " "
echo "  === List directory after delete : $PortaWebdb01_export_directory ==="
echo " "
        # List csv directory
        ls -lrth $PortaWebdb01_export_directory

echo " "
echo "########## END OF SCRIPT PortaDB-export-csv.sh - `date` ##########"
echo " "

