#!/bin/bash
# ----------------------------------------------------------------------#
#             	    Verif_Bascule_Porta_MOBI.sh                         #
# ----------------------------------------------------------------------#
# Auteur :	Frederickk Vernon frederick.vernon@digicelgroup.fr	#
# Modif   : 	David AYMERIC david.aymeric@digicelgroup.fr             #
# Version :     2.0                      	    	                #
# Date :        01/03/2013                  	                        #
# ----------------------------------------------------------------------#
# Historique des versions :                                             #
# - v2.0 01/03/2013 : 							#
#   Ajout des verification avec PortaDB					#
#   Ajout du cartouche de commentaires	     				#
#   Deplacement et adaptation du script de srvitc ver portaWebdb	#
# ----------------------------------------------------------------------#
# Desciption :                                                          #
#    Ce script a pour but de controler la mise en oeuvre des bascules   #
#    Porta dans MOBI et de comparer les resultats avec les donnees 	#
#    issues de la BDD PortaDB 					    	#
# ----------------------------------------------------------------------#
# Planification :                                                       #
#    via /etc/crontab chaques jours ouvres suite a la bascule 	      	#
# ----------------------------------------------------------------------#

#************************************************************************
# Set Variables 
#************************************************************************

# Client Oracle MOBI
ORACLE_SID='MCST50A.BTC.COM'
DB_USER='pb'
DB_PASSWD='gaston'

# Load environment variables of porta user for Oracle Client 
. /home/porta_pnmv3/.profile

#************************************************************************
# Construction de l'email 
#************************************************************************

# email information
email_From="oracle@digicelgroup.fr"
email_To="frederick.vernon@digicelgroup.fr"
email_Cc="sarah.mogade@digicelgroup.fr,frederic.arduin@digicelgroup.fr,Benoit.Pelage@digicelgroup.fr,Katia.VIRTOS@digicelgroup.fr"

email_1_Subject="[PNMV3]Verification Bascule Porta MOBI"
email_2_Subject="[PNMV3]Verification Bascule Porta MOBI : FIN "

email_Body=/tmp/Bascule.html

# email body initialisation
touch $email_Body
rm $email_Body

#************************************************************************
# Procedures d'affichage ecran pour log/debug
#************************************************************************
function afficher_trace {
  echo "INFO_SCRIPT ($(date '+%d/%m/%Y %H:%M:%S')) : $1"
}
function afficher_erreur {
  echo "ERREUR : $1"
}
function afficher_msg {
  echo "$1"
}

#************************************************************************
# Recuperation donnees issue de la BDD PortaDB
#************************************************************************
# Nb Porta entrantes du jour
# old : do not managed date_portage changement during 1410     Nb_PE_PortaDB=`mysql -N -e "SELECT COUNT(*) FROM PortaDB.PORTAGE where date_portage >= CURDATE() and date_portage < CURDATE()+1 and etat_id_actuel in (8,9);"`
Nb_PE_PortaDB=`mysql -N -e "select count(*) from (select PortaDB.P.msisdn, count(*) from PortaDB.PORTAGE P inner join PortaDB.PORTAGE_DATA PD on PortaDB.PD.portage_id = PortaDB.P.id inner join PortaDB.DATA d ON PortaDB.d.id_portage = PortaDB.P.id_portage and PortaDB.d.code_ticket in ('1110','1120') and PortaDB.d.fichier_id is not null and PortaDB.d.source ='out' where date(PortaDB.P.date_portage) = date(now()) and PortaDB.P.etat_id_actuel in (8,9) group by PortaDB.P.msisdn having count(*) = 1) t;"`

# Nb Porta sortantes du jour
# old : do not managed date_portage changement during 1410     Nb_PS_PortaDB=`mysql -N -e "SELECT COUNT(*) FROM PortaDB.PORTAGE where date_portage >= CURDATE() and date_portage < CURDATE()+1 and etat_id_actuel in(21,22);"`
Nb_PS_PortaDB=`mysql -N -e "select count(PortaDB.P.msisdn) from PortaDB.PORTAGE P inner join PortaDB.PORTAGE_DATA PD on PortaDB.PD.portage_id = PortaDB.P.id inner join PortaDB.DATA d ON PortaDB.d.id_portage = PortaDB.P.id_portage and PortaDB.d.code_ticket in ('1110','1120') and PortaDB.d.fichier_id is not null and PortaDB.d.source ='in' where PortaDB.PD.item_value = 'mastercrm' and date(PortaDB.P.date_portage) = date(now()) and PortaDB.P.etat_id_actuel in (21,22);"`

#************************************************************************
# Debut d'execution
#*************************************************************************
echo " "
afficher_trace 'Debut script'

#************************************************************************
# Verification des MSISDN bascules (9H15)
#************************************************************************

afficher_trace 'Verification des MSISDN bascules'

Nb_bascules_MSR=`sqlplus -s $DB_USER/$DB_PASSWD@$ORACLE_SID << fin | grep -v "^$"
set space 1
set heading  off
set colsep "|"
set trims on
set pagesize 100
set linesize 1000
SELECT COUNT(DISTINCT(DIC_005)) FROM send_actions
WHERE action_code LIKE 'MSR%'
AND log_date = TRUNC(SYSDATE)
AND dic_029 = 'PORTA';

fin`

Nb_bascules_RL=`sqlplus -s $DB_USER/$DB_PASSWD@$ORACLE_SID << fin | grep -v "^$"
set space 1
set heading  off
set colsep "|"
set trims on
set pagesize 100
set linesize 1000
SELECT COUNT(DISTINCT(DIC_005)) FROM send_actions
WHERE action_code LIKE 'RL%'
AND log_date = TRUNC(SYSDATE)
AND dic_029 = 'PORTA';

fin`

### Statut general de la bascule 
if [ $Nb_bascules_MSR -gt 0 ] && [ $Nb_bascules_RL -gt 0 ] ; then
	echo "Bonjour," >> $email_Body
	echo " " >> $email_Body
	echo "Bascule MSR et RL : en cours" >> $email_Body
elif [ $Nb_bascules_MSR -eq 0 ] && [ $Nb_bascules_RL -eq 0 ] ; then  
        echo "Bonjour,"  >> $email_Body
	echo " " >> $email_Body
        echo "Pas de bascule MSR et RL ce jour" >> $email_Body
elif [ $Nb_bascules_MSR -gt 0 ] && [ $Nb_bascules_RL -eq 0 ] ; then
        echo "Bonjour,>"  >> $email_Body
	echo " " >> $email_Body
        echo "Bascule MSR en cours || Pas de bascule RL ce jour" >> $email_Body
elif [ $Nb_bascules_MSR -eq 0 ] && [ $Nb_bascules_RL -gt 0 ] ; then
        echo "Bonjour,"  >> $email_Body
        echo " " >> $email_Body
	echo "Bascule RL: en cours || Pas de bascule MSR ce jour" >> $email_Body
fi

### Comparaison bascule PortaDB Versus bascule MOBI
if [ $Nb_bascules_MSR -ne $Nb_PE_PortaDB ] || [ $Nb_bascules_RL -ne $Nb_PS_PortaDB ] ; then
	# Incoherencentre les 2 sources de donnees
    	echo " " >> $email_Body
	echo "Attention ! Le nombre de bascules dans PortaDB differe de celui de MOBI !" >> $email_Body
fi
		
#************************************************************************
# Nombre de MSR OK ou KO (09H15)
#************************************************************************

afficher_trace 'Nombre de MSR OK'

Bascule_MSR_OK=`sqlplus -s $DB_USER/$DB_PASSWD@$ORACLE_SID << fin | grep -v "^$"
set space 1
set heading  off
set colsep "|"
set trims on
set pagesize 100
set linesize 1000
SELECT COUNT(DISTINCT(DIC_005)) FROM send_actions
WHERE action_code LIKE 'MSR%'
AND log_date = TRUNC(SYSDATE)
AND dic_029 = 'PORTA'
AND FOLOW_UP_STATUS = 30;

fin`

afficher_trace 'Nombre de RL OK'

Bascule_RL_OK=`sqlplus -s $DB_USER/$DB_PASSWD@$ORACLE_SID << fin | grep -v "^$"
set space 1
set heading  off
set colsep "|"
set trims on
set pagesize 100
set linesize 1000
SELECT COUNT(DISTINCT(DIC_005)) FROM send_actions
WHERE action_code LIKE 'RL%'
AND log_date = TRUNC(SYSDATE)
AND dic_029 = 'PORTA'
AND FOLOW_UP_STATUS = 30;

fin`

#************************************************************************
# Envoi de l'email numero 1
#************************************************************************

# Bilan Information MSR et RL : 
echo " " >> $email_Body 
echo "Verifications MSR :" >> $email_Body
echo "--------------------------- :" >> $email_Body
echo "MSR MOBI OK      : $Bascule_MSR_OK" >> $email_Body
echo "Total MSR MOBI  : $Nb_bascules_MSR" >> $email_Body
echo "Total PE PortaDB :           $Nb_PE_PortaDB" >> $email_Body
echo " "  >> $email_Body
echo "Verifications RL  :" >> $email_Body
echo "--------------------------- :" >> $email_Body
echo "RL MOBI OK         : $Bascule_RL_OK" >> $email_Body
echo "Total RL MOBI     : $Nb_bascules_RL" >> $email_Body
echo "Total PS PortaDB :           $Nb_PS_PortaDB" >> $email_Body
echo " "  >> $email_Body
echo "Cordialement" >> $email_Body

# Envoie de l'email 
cat $email_Body| mail -a "From: $email_From" -s "$email_1_Subject" $email_To -c $email_Cc

# Reinitialisation du corps de l'email pour envoi numero 2
rm $email_Body

#************************************************************************
# Nombre de MSR OK ou KO (jusqu'a 10H05)
#************************************************************************

if [ $Bascule_MSR_OK -eq $Nb_bascules_MSR ] && [ $Bascule_RL_OK -eq $Nb_bascules_RL ]
then
	echo "Les MSR et RL du jour ont correctement ete bascules sur MOBI"  >> $email_Body
	echo " " >> $email_Body
else 

a=1
while [ $Bascule_MSR_OK -ne $Nb_bascules_MSR ] && [ `date +%H%M` -lt 1005 ] || [ $Bascule_RL_OK -ne $Nb_bascules_RL ] && [ `date +%H%M` -lt 1005 ]
do

sleep 30

Nb_bascules_MSR=`sqlplus -s $DB_USER/$DB_PASSWD@$ORACLE_SID << fin | grep -v "^$"
set space 1
set heading  off
set colsep "|"
set trims on
set pagesize 100
set linesize 1000
SELECT COUNT(DISTINCT(DIC_005)) FROM send_actions
WHERE action_code LIKE 'MSR%'
AND log_date = TRUNC(SYSDATE)
AND dic_029 = 'PORTA';
fin`

Bascule_MSR_OK=`sqlplus -s $DB_USER/$DB_PASSWD@$ORACLE_SID << fin | grep -v "^$"
set space 1
set heading  off
set colsep "|"
set trims on
set pagesize 100
set linesize 1000
SELECT COUNT(DISTINCT(DIC_005)) FROM send_actions
WHERE action_code LIKE 'MSR%'
AND log_date = TRUNC(SYSDATE)
AND dic_029 = 'PORTA'
AND FOLOW_UP_STATUS = 30;
fin`

Nb_bascules_RL=`sqlplus -s $DB_USER/$DB_PASSWD@$ORACLE_SID << fin | grep -v "^$"
set space 1
set heading  off
set colsep "|"
set trims on
set pagesize 100
set linesize 1000
SELECT COUNT(DISTINCT(DIC_005)) FROM send_actions
WHERE action_code LIKE 'RL%'
AND log_date = TRUNC(SYSDATE)
AND dic_029 = 'PORTA';
fin`

Bascule_RL_OK=`sqlplus -s $DB_USER/$DB_PASSWD@$ORACLE_SID << fin | grep -v "^$"
set space 1
set heading  off
set colsep "|"
set trims on
set pagesize 100
set linesize 1000
SELECT COUNT(DISTINCT(DIC_005)) FROM send_actions
WHERE action_code LIKE 'RL%'
AND log_date = TRUNC(SYSDATE)
AND dic_029 = 'PORTA'
AND FOLOW_UP_STATUS = 30;
fin`

let a++

done

fi

#Controle des MSR en fin de traitement

if [ $Bascule_MSR_OK -ne $Nb_bascules_MSR ]
then
    
afficher_trace 'Nombre de MSR KO'

Bascule_MSR_KO=`sqlplus -s $DB_USER/$DB_PASSWD@$ORACLE_SID << fin | grep -v "^$"
set space 1
set heading  off
set colsep "|"
set trims on
set pagesize 100
set linesize 1000
SELECT COUNT(DISTINCT(DIC_005)) FROM send_actions
WHERE action_code LIKE 'MSR%'
AND log_date = TRUNC(SYSDATE)
AND dic_029 = 'PORTA'
AND FOLOW_UP_STATUS = 14;

fin`

Liste_MSR_KO=`sqlplus -s $DB_USER/$DB_PASSWD@$ORACLE_SID << fin | grep -v "^$"
set space 1
set heading  off
set colsep "|"
set trims on
set pagesize 100
set linesize 1000
SELECT DISTINCT(dic_005) FROM send_actions
WHERE action_code LIKE 'MSR%'
AND log_date = TRUNC(SYSDATE)
AND dic_029 = 'PORTA'
AND FOLOW_UP_STATUS = 14;

fin`

afficher_trace 'Rapport MSR'
echo "==========   Rapport MSR   ==========" >> $email_Body
echo "Il y a $Bascule_MSR_KO MSR KO sur un total de $Nb_bascules_MSR" >> $email_Body
echo " " >> $email_Body
echo "Liste des MSR en echec : $Liste_MSR_KO" >> $email_Body
echo " " >> $email_Body
echo "Merci d'effectuer les rattrapages adequates"   >> $email_Body
echo " " >> $email_Body
    
else

afficher_trace 'Rapport MSR'
echo "==========   Rapport MSR   ==========" >> $email_Body
echo "Il y a $Bascule_MSR_OK MSR OK sur un total de $Nb_bascules_MSR" >> $email_Body
	    
fi 

#Controle des RL en fin de traitement
if [ $Bascule_RL_OK -ne $Nb_bascules_RL ]
then
    
afficher_trace 'Nombre de RL KO'

Bascule_RL_KO=`sqlplus -s $DB_USER/$DB_PASSWD@$ORACLE_SID << fin | grep -v "^$"
set space 1
set heading  off
set colsep "|"
set trims on
set pagesize 100
set linesize 1000
SELECT COUNT(DISTINCT(DIC_005)) FROM send_actions
WHERE action_code LIKE 'RL%'
AND log_date = TRUNC(SYSDATE)
AND dic_029 = 'PORTA'
AND FOLOW_UP_STATUS = 14;

fin`

Liste_RL_KO=`sqlplus -s $DB_USER/$DB_PASSWD@$ORACLE_SID << fin | grep -v "^$"
set space 1
set heading  off
set colsep "|"
set trims on
set pagesize 100
set linesize 1000
SELECT DISTINCT(dic_005) FROM send_actions
WHERE action_code LIKE 'RL%'
AND log_date = TRUNC(SYSDATE)
AND dic_029 = 'PORTA'
AND FOLOW_UP_STATUS = 14;

fin`

afficher_trace 'Rapport RL'
echo "==========   Rapport RL   ==========" >> $email_Body
echo "Il y a $Bascule_RL_KO RL KO sur un total de $Nb_bascules_RL" >> $email_Body
echo " " >> $email_Body
echo "Liste des RL en echec : $Liste_RL_KO" >> $email_Body
echo " " >> $email_Body
echo "Merci d'effectuer les rattrapages adequates"   >> $email_Body
echo " " >> $email_Body

else

afficher_trace 'Rapport RL'    
echo "==========   Rapport RL   ==========" >> $email_Body
echo "Il y a $Bascule_RL_OK RL OK sur un total de $Nb_bascules_RL" >> $email_Body
    
fi

echo " " >> $email_Body
echo "Cordialement" >> $email_Body

#************************************************************************
# Envoi de l'email numero 2
#************************************************************************

# Evoie mail 
cat $email_Body| mail -a "From: $email_From" -s "$email_2_Subject" $email_To -c $email_Cc

#************************************************************************
# Fin script
#************************************************************************
afficher_trace 'Fin script'
echo " "
