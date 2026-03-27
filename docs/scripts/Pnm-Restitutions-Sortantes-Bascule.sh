#!/bin/bash
#-----------------------------------------------------------------------#
#		Pnm-Restitutions-Sortantes-Bascule.sh			#
#-----------------------------------------------------------------------#
# Author : 	  David AYMERIC david.aymeric@digicelgroup.fr		#
# Contributor :   Marc MAVINGA                                          #
# Last modified : 28/08/2014						#
# Version : 	  1.0							#
# Date : 	  11/03/2013						#
#-----------------------------------------------------------------------#
# History of versions :							#
#	- v1.0 11/03/2013 : Creation of the scrip			#
#       - v2.0 28/08/2014 : Modification de la selection des Numeros    #
#-----------------------------------------------------------------------#
# Purpose :                                                             #
#    Manage Restitutions Sortantes process                              #
#    part MOBI update during Bascule		                        #
# Description :                                                         #
#       1) Extract Restitutions Sortantes Saisies  from PortaDB         #
#       2) Update misdsn status and stock in Mobi DB                    #
#-----------------------------------------------------------------------#
# Scheduling :								#
#   	run every thursday at 11h00 					#
#	via /etc/crontab with porta_pnmv3 user				#
#-----------------------------------------------------------------------#

echo "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
echo "|||| BEGIN OF SCRIPT $0 - `date` |||||"
echo "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
echo " "

# **********************************************************************#
# Set Variables
# **********************************************************************#

# interval of the extract (interval_inf <= J < interval_sup)
# default is CURDATE() <= J < CURDATE()+1
interval_inf=`date +%F -d "-0 days"`
interval_sup=`date +%F -d "1 days"`

# Porta web service URL
WS_server=`hostname -i`

# Client Oracle MOBI (Production DB)
ORACLE_SID='MCST50A.BTC.COM'
DB_USER='pb'
DB_PASSWD='gaston'

# Load environment variables of porta user for Oracle Client
. ~/.profile

# working file
porta_extract_restitutions_sortantes_resultat=~/Resultats/PORTA-Extract-Restitutions_Sortantes.txt

# *********************************************************************#
# Extract Restitutions Sortantes from PORTA DB
# *********************************************************************#

echo "	---------------------------------------------------------------"
echo "	-----    Extract Restitutions Sortantes from PortaDB    -------"
echo "	---------------------------------------------------------------"
echo " "

# **********************************
# SQL Request		           *
# **********************************

#################################### OBSOLETE ##########################################################
# Extract restitutions sortantes etat 61 or 62 (bascule or cloture) from PortaDB
# mysql -N -e "SELECT DISTINCT(PortaDB.DATA.msisdn) FROM PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel in (61,62) and PortaDB.PORTAGE.id_portage=PortaDB.DATA.id_portage and PortaDB.DATA.date_restitution >= '$interval_inf' and PortaDB.DATA.date_restitution < '$interval_sup' and PortaDB.DATA.code_ticket=3410 and PortaDB.DATA.OPR=2;" > $porta_extract_restitutions_sortantes_resultat
########################################################################################################

#Extract restitutions sortantes etat 56 (saisi) from PortaDB
mysql -N -e "SELECT DISTINCT(PortaDB.DATA.msisdn) FROM PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel in (56) and PortaDB.PORTAGE.id_portage=PortaDB.DATA.id_portage and PortaDB.DATA.date_creation_ticket >= '$interval_inf' and PortaDB.DATA.date_creation_ticket < '$interval_sup' and PortaDB.DATA.code_ticket=3400 and PortaDB.DATA.OPR=2;" > $porta_extract_restitutions_sortantes_resultat



nb_lines=`wc -l $porta_extract_restitutions_sortantes_resultat | cut -f1 -d' '`

echo "	Nombre de restitutions a traiter : $nb_lines"
echo " "

# **********************************
# Rework SQL output resultat  	   *
# **********************************

i=1
while [ $i -le $nb_lines ]
do
	# compute msisdn line i 
	msisdn=`sed -n "${i}p" $porta_extract_restitutions_sortantes_resultat`
	
		# build msisdn list format SQL (msisdn1,msisdn2,...,msisdnN) for further PNL SQL processing

		# add first and only msisdn to the list
		if [[ $i -eq 1 && $nb_lines -eq 1 ]]

		then SQL_msisdn_liste="(""$msisdn"")"
		
		# add first msisdn to the list
		elif [[ $i -eq 1 && $nb_lines -ne 1 ]]
		then SQL_msisdn_liste="(""$msisdn"","
		
		elif [ $i -lt $nb_lines ]
		# add msisdn i to the list
		then SQL_msisdn_liste="$SQL_msisdn_liste""$msisdn"","

		# add last msisdn to the list
		else SQL_msisdn_liste="$SQL_msisdn_liste""$msisdn"")"

		fi
	
	# go to line i+1
	let i=$((i+1))
done

# **********************************************************************#
# Update reinstituted misdn status / Stock in Mobi DB			#
# **********************************************************************#

echo "	---------------------------------------------------------------"
echo "	--------  Update msisdn status and stock in Mobi DB  ----------"
echo "	---------------------------------------------------------------"
echo " "

# Skip update if script is not run from PROD system 
if [ `hostname -i` = '172.24.119.68' ]
then

if [ $nb_lines -eq 0 ]
then 
	echo "	No line to update in Mobi"
else

# Sql request on MOBI DB

sqlplus -s $DB_USER/$DB_PASSWD@$ORACLE_SID << fin
UPDATE MSISDN
SET ST_MSISDN_ID='7',MSISDN_STATUS='0', MSISDN_CHANGE = TRUNC(SYSDATE)
WHERE msisdn_no IN $SQL_msisdn_liste;
COMMIT;
fin

fi

else
	echo "	No Mobi update from Porta Perf System"
	echo " "
fi

echo "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
echo "|||| END OF SCRIPT $0 - `date` |||||"
echo "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
echo " "
