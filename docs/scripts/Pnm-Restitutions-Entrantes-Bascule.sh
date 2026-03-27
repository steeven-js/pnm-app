#!/bin/bash
#-----------------------------------------------------------------------#
#		Pnm-Restitutions-Entrantes-Bascule.sh							#
#-----------------------------------------------------------------------#
# Author : 	  David AYMERIC david.aymeric@digicelgroup.fr				#
# Last modified :														#
# Version : 	  1.1													#
# Date : 	  26/10/2015												#
#-----------------------------------------------------------------------#
# History of versions :													#
#	- v1.0 11/03/2013 : Creation of the script							#
#   - v1.1 26/10/2015 : - new date to check restitutions at day-21		#
#                       - new sql query to select only restitutions		#
#						  confirmed by all operators					#
#                       - new sql query to update only Digicel msisdn's	#
#-----------------------------------------------------------------------#
# Purpose :                                                             #
#    Manage Restitutions Entrantes process                              #
#    part MOBI update during Bascule                                    #
# Description :                                                         #
#       1) Extract Restitutions Entrantes Bascules from PortaDB         #
#       2) Update misdsn status and stock in Mobi DB                    #
#-----------------------------------------------------------------------#
# Scheduling :															#
#   	run every working day at 21h00									#
#	via /etc/crontab with porta_pnmv3 user								#
#-----------------------------------------------------------------------#

echo "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
echo "||||||| BEGIN OF SCRIPT $0 - `date` |||||||||"
echo "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
echo " "

# **********************************************************************#
# Set Variables
# **********************************************************************#

# interval of the extract (interval_inf <= J < interval_sup)
# default is CURDATE() <= J < CURDATE()+1
#### OLD v1.0 ####
#interval_inf=`date +%F -d "-0 days"`
#interval_sup=`date +%F -d "1 days"`

#date a J-21 pour laisser aux operateurs le temps de confirmer les restitutions
date_rest=`date +%F -d "-21 days"`


# Porta web service URL
WS_server=`hostname -i`

# Client Oracle MOBI (Production DB)
ORACLE_SID='MCST50A.BTC.COM'
DB_USER='pb'
DB_PASSWD='gaston'

# Load environment variables of porta user for Oracle Client
. ~/.profile

# working file
porta_extract_restitutions_entrantes_resultat=~/Resultats/PORTA-Extract-Restitutions_Entrantes.txt

# *********************************************************************#
# Extract Restitutions Entrantes from PORTA DB
# *********************************************************************#

echo "	---------------------------------------------------------------"
echo "	-----    Extract Restitutions Entrantes from PortaDB    -------"
echo "	---------------------------------------------------------------"
echo " "

# **********************************
# SQL Request		           *
# **********************************

# Extract restitutions entrantes etat 54 or 55 (bascule or cloture) from PortaDB
##### OLD v1.0 #####
#mysql -N -e "SELECT DISTINCT(PortaDB.DATA.msisdn) FROM PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel in (54,55) and PortaDB.PORTAGE.id_portage=PortaDB.DATA.id_portage and PortaDB.DATA.date_restitution >= '$interval_inf' and  PortaDB.DATA.date_restitution < '$interval_sup' and PortaDB.DATA.code_ticket=3410 and PortaDB.DATA.OPA=2;" > $porta_extract_restitutions_entrantes_resultat

mysql -N -e "SELECT DISTINCT(PortaDB.DATA.msisdn) FROM PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 55 and PortaDB.PORTAGE.id_portage=PortaDB.DATA.id_portage and date(PortaDB.PORTAGE.date_portage) = '$date_rest' and concat(PortaDB.DATA.code_ticket,PortaDB.DATA.operateur_origine) in ('34301','34303','34304','34305','34306') group by PortaDB.DATA.msisdn having count(distinct(concat(PortaDB.DATA.code_ticket,PortaDB.DATA.operateur_origine))) = '5';" > $porta_extract_restitutions_entrantes_resultat

nb_lines=`wc -l $porta_extract_restitutions_entrantes_resultat | cut -f1 -d' '`

echo "	Nombre de restitutions a traiter : $nb_lines"
echo " "

# **********************************
# Rework SQL output resultat  	   *
# **********************************

i=1
while [ $i -le $nb_lines ]
do
	# compute msisdn line i 
	msisdn=`sed -n "${i}p" $porta_extract_restitutions_entrantes_resultat`
	
	# build msisdn list format SQL (msisdn1,msisdn2,...,msisdnN) for further PNL SQL processing
        if [ $i -eq 1 ]
        then
                # add first msisdn to the list
                SQL_msisdn_liste="(""$msisdn"","
        elif [ $i -lt $nb_lines ]
        then
                # add msisdn i to the list
                 SQL_msisdn_liste="$SQL_msisdn_liste""$msisdn"","
        else
                # add last msisdn to the list
                SQL_msisdn_liste="$SQL_msisdn_liste""$msisdn"")"
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
SET ST_MSISDN_ID='0',MSISDN_STATUS='0', MSISDN_CHANGE = TRUNC(SYSDATE)
WHERE msisdn_no IN $SQL_msisdn_liste
AND ST_MSISDN_ID='7'
AND MSISDN_STATUS in ('0','1')
AND OPERATION_ID in ('1','2','3');
COMMIT;
fin

fi

else
	echo "	No Mobi update from Porta Perf System"
	echo " "
fi

echo "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
echo "||||||| END OF SCRIPT $0 - `date` |||||||||"
echo "|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||"
echo " "
