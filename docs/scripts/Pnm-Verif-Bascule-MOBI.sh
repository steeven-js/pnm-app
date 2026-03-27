#!/bin/bash
# ----------------------------------------------------------------------#
#             	    Verif_Bascule_Porta_MOBI.sh                         #
# ----------------------------------------------------------------------#
# Auteur :	Frederick Vernon frederick.vernon@digicelgroup.fr	        #
# Modif   : 	David AYMERIC david.aymeric@digicelgroup.fr             #
# Version :     2.0                      	    	                    #
# Date :        01/03/2013                  	                        #
# ----------------------------------------------------------------------#
# Historique des versions :                                             #
# - v2.0 01/03/2013 : 							                        #
#   Ajout des verification avec PortaDB					                #
#   Ajout du cartouche de commentaires	     				            #
#   Deplacement et adaptation du script de srvitc ver portaWebdb	    #
#   Ajout des vérifications des bascules prévues à J+1                  #
#																		#
# - v2.1 15/09/2015 :													#
#	Ajout des verifications sur les portages KO à la prochaine bascule  #
#	Modification des scripts date(now) a la place de curdate()      	#
#																		#
# - V2.2 19/01/2017 :													#
#	Ajout du MSISDN Temporaire											#
# ----------------------------------------------------------------------#
# Desciption :                                                          #
#    Ce script a pour but de controler la mise en oeuvre des bascules   #
#    Porta dans MOBI et de comparer les resultats avec les donnees 	    #
#    issues de la BDD PortaDB 					                    	#
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
#email_To="frederic.arduin@digicelgroup.fr"
email_Cc="fwi_pnm_si@digicelgroup.fr"
#email_Cc="frederic.arduin@digicelgroup.fr"

email_1_Subject="[PNMV3]Verification Bascule Porta MOBI"
email_2_Subject="[PNMV3]Verification Bascule Porta MOBI : FIN "

email_Body=/tmp/Bascule.html

# email body initialisation
rm $email_Body
touch $email_Body

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
# Recuperation des infos sur les bascules KO a J+1
#************************************************************************

day=`mysql -N -e "select dayofweek(curdate());"`
ferryday=`mysql -N -e "select count(*) from PortaDB.FERRYDAY where PortaDB.FERRYDAY.ferryday = curdate();"`

: '
#MAJ du 05-04-2017 suite au ticket RT#151707

# Nb Porta KO dans le futur
Nb_Porta_KO_PortaDB=`mysql -N -e "select count(distinct(PortaDB.PORTAGE.id_portage)) from PortaDB.PORTAGE where date(PortaDB.PORTAGE.date_portage) > date(now()) and PortaDB.PORTAGE.etat_id_actuel < 15 and PortaDB.PORTAGE.id not in (select PortaDB.PORTAGE_DATA.portage_id from PortaDB.PORTAGE_DATA);"`

# Liste MSISDN Porta KO dans le futur
Liste_Porta_KO_PortaDB=`mysql -N -e "select distinct(PortaDB.PORTAGE.msisdn) from PortaDB.PORTAGE where date(PortaDB.PORTAGE.date_portage) > date(now()) and PortaDB.PORTAGE.etat_id_actuel < 15 and PortaDB.PORTAGE.id not in (select PortaDB.PORTAGE_DATA.portage_id from PortaDB.PORTAGE_DATA);"`

'

if [ $day -eq 6 ]

then

# Nb Porta KO à J+1
Nb_Porta_KO_PortaDB=`mysql -N -e "select count(distinct(PortaDB.PORTAGE.id_portage)) from PortaDB.PORTAGE where date(PortaDB.PORTAGE.date_portage) = date(now()+INTERVAL 3 DAY) and PortaDB.PORTAGE.etat_id_actuel < 15 and PortaDB.PORTAGE.etat_id_actuel <> 4 and PortaDB.PORTAGE.id not in (select PortaDB.PORTAGE_DATA.portage_id from PortaDB.PORTAGE_DATA);"`

# Liste MSISDN Porta KO à J+1
Liste_Porta_KO_PortaDB=`mysql -N -e "select distinct(PortaDB.PORTAGE.msisdn) from PortaDB.PORTAGE where date(PortaDB.PORTAGE.date_portage) = date(now()+INTERVAL 3 DAY) and PortaDB.PORTAGE.etat_id_actuel < 15 and PortaDB.PORTAGE.etat_id_actuel <> 4 and PortaDB.PORTAGE.id not in (select PortaDB.PORTAGE_DATA.portage_id from PortaDB.PORTAGE_DATA);"`

else

# Nb Porta KO à J+1
Nb_Porta_KO_PortaDB=`mysql -N -e "select count(distinct(PortaDB.PORTAGE.id_portage)) from PortaDB.PORTAGE where date(PortaDB.PORTAGE.date_portage) = date(now()+INTERVAL 1 DAY) and PortaDB.PORTAGE.etat_id_actuel < 15 and PortaDB.PORTAGE.etat_id_actuel <> 4 and PortaDB.PORTAGE.id not in (select PortaDB.PORTAGE_DATA.portage_id from PortaDB.PORTAGE_DATA);"`

# Liste MSISDN Porta KO à J+1
Liste_Porta_KO_PortaDB=`mysql -N -e "select distinct(PortaDB.PORTAGE.msisdn) from PortaDB.PORTAGE where date(PortaDB.PORTAGE.date_portage) = date(now()+INTERVAL 1 DAY) and PortaDB.PORTAGE.etat_id_actuel < 15 and PortaDB.PORTAGE.etat_id_actuel <> 4 and PortaDB.PORTAGE.id not in (select PortaDB.PORTAGE_DATA.portage_id from PortaDB.PORTAGE_DATA);"`

fi


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
elif [ $Nb_bascules_MSR -eq 0 ] && [ $Nb_bascules_RL -eq 0 ] && [ $ferryday -eq 1 ] ; then
        echo "Bonjour,"  >> $email_Body
	echo " " >> $email_Body
		echo "Jour ferie => Pas de bascule" >> $email_Body
	echo " " >> $email_Body
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

if [ $ferryday -eq 1 ]
then
	echo "Jour ferie => Pas de bascule" >> $email_Body
	echo " " >> $email_Body
elif [ $Bascule_MSR_OK -eq $Nb_bascules_MSR ] && [ $Bascule_RL_OK -eq $Nb_bascules_RL ]
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
SELECT count (line_msisdn_active)
FROM line
WHERE line_status = '20'
AND line_msisdn_active in
(
SELECT DISTINCT(DIC_005) FROM send_actions
WHERE action_code LIKE 'MSR%'
AND log_date = TRUNC(SYSDATE)
AND dic_029 = 'PORTA'
)
;
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
SELECT COUNT (line_msisdn_active)
FROM line
WHERE line_status <> '20'
AND line_msisdn_active in
(
SELECT DISTINCT(dic_005) FROM send_actions
WHERE action_code LIKE 'MSR%'
AND log_date = TRUNC(SYSDATE)
AND dic_029 = 'PORTA'
AND FOLOW_UP_STATUS = 14
);

fin`

Liste_MSR_KO=`sqlplus -s $DB_USER/$DB_PASSWD@$ORACLE_SID << fin | grep -v "^$"
set space 1
set heading  off
set colsep "|"
set trims on
set pagesize 100
set linesize 1000
SELECT line_msisdn_active
FROM line
WHERE line_status <> '20'
AND line_msisdn_active in
(
SELECT DISTINCT(dic_005) FROM send_actions
WHERE action_code LIKE 'MSR%'
AND log_date = TRUNC(SYSDATE)
AND dic_029 = 'PORTA'
AND FOLOW_UP_STATUS = 14
);

fin`

afficher_trace 'Rapport MSR'
echo "==========   Rapport MSR   ==========" >> $email_Body
echo "Il y a $Bascule_MSR_KO MSR KO sur un total de $Nb_bascules_MSR" >> $email_Body
echo " " >> $email_Body
echo "Liste des MSR en echec : $Liste_MSR_KO" >> $email_Body
echo " " >> $email_Body
echo "Merci d'effectuer les rattrapages adequats"   >> $email_Body
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
echo "Merci d'effectuer les rattrapages adequats"   >> $email_Body
echo " " >> $email_Body

else

afficher_trace 'Rapport RL'    
echo "==========   Rapport RL   ==========" >> $email_Body
echo "Il y a $Bascule_RL_OK RL OK sur un total de $Nb_bascules_RL" >> $email_Body
    
fi


if [ $Nb_Porta_KO_PortaDB -ge 1 ]

then

afficher_trace 'Rapport sur la prochaine bascule'
echo "==========   Rapport sur la prochaine bascule   ==========" >> $email_Body
echo "Il y a $Nb_Porta_KO_PortaDB MSR KO pour la prochaine bascule" >> $email_Body 
echo " " >> $email_Body
echo "Liste MSR KO : $Liste_Porta_KO_PortaDB" >> $email_Body



#echo "$Liste_Porta_KO_PortaDB" > Liste_MSISDN_KO.txt

#ssh root@vmqproportaweb01 "echo '$Liste_Porta_KO_PortaDB' > /home/porta_pnmv3/scripts/Liste_num.txt"

#cd /home/porta_pnmv3/Scripts/

#scp Liste_MSISDN_KO.txt root@vmqproportaweb01:/home/porta_pnmv3/scripts/

#***************************************************
# Execution du script a distance (vmqproportaweb01)
#***************************************************

#ssh root@vmqproportaweb01 "/home/porta_pnmv3/scripts/find_temporary_msisdn.sh"

#**********************************
# Compteur Nbre de lignes a traiter
#**********************************

#N=`wc -l MSISDN_TEMP.txt | awk -F " " '{print $1}'`

#N=`ssh root@vmqproportaweb01 "wc -l /home/porta_pnmv3/scripts/Liste_num.txt " | awk -F " " '{print $1}'`

#*********************************************************************
# Initialisation des variables MSISDN a porter et MSISDN temporaires
#*********************************************************************

#MSISDN=(`ssh root@vmqproportaweb01 "cat /home/porta_pnmv3/scripts/Result_msisdn_maj.txt"  | awk -F "/ " '{print $1}' | tail -$N`)

#echo $MSISDN

#TEMP=(`ssh root@vmqproportaweb01 "cat /home/porta_pnmv3/scripts/Result_msisdn_maj.txt"  | awk -F "/ " '{ $1 = "" ; print $0 }' | grep -v "^$"`)

echo " " >> $email_Body

echo "Verification des donnees inserees dans la table PORTAGE_DATA + MSISDN a porter associe" >> $email_Body

echo " " >> $email_Body


#echo $Liste_Porta_KO_PortaDB >> msisdn.txt
#sed "s+ +\n+g" msisdn.txt >> Result_msisdn.txt
#cat Result_msisdn.txt >> $MSISDN
#echo $MSISDN;

echo "$Liste_Porta_KO_PortaDB" > Result_msisdn.txt
#MSISDN=`cat Result_msisdn.txt`
#echo $MSISDN

#for toto in `cat Result_msisdn.txt`; do echo "ma commande avec mon smisdn= $toto"; done

for MSISDN in `cat Result_msisdn.txt`

do

#**************
# Recherche ID
#**************

ID=`mysql -N -e "SELECT PortaDB.PORTAGE.id FROM PortaDB.PORTAGE where PortaDB.PORTAGE.msisdn =$MSISDN and PortaDB.PORTAGE.date_fin is null;"`

#echo $ID >> $email_Body


TEMP=`mysql -N -e "select DP.msisdn_temporaire from PortaDB.PORTAGE P inner join PortaWebDB.demande_portage DP ON DP.msisdn=P.msisdn and DP.portage=P.date_portage where P.msisdn =$MSISDN and P.date_fin is null limit 0,1;"`

#echo $TEMP >> $email_Body


#***********************************************************************************
# Insertion dans la table PORTAGE_DATA du MSISDN_TEMPORAIRE pour prochaine bascule
#***********************************************************************************

INSERT_PDATA=`mysql -N -e "insert into PortaDB.PORTAGE_DATA ( portage_id,creation_date,temporary_msisdn) values ($ID,NOW(),'$TEMP');"`

#CHECK_PDATA=`mysql -N -e "select P.msisdn, DP.msisdn_temporaire from PortaDB.PORTAGE P inner join PortaWebDB.demande_portage DP ON DP.msisdn=P.msisdn and DP.portage=P.date_portage where P.msisdn =$MSISDN and P.date_fin is null limit 0,1;"`

#echo $INSERT_PDATA >> $email_Body

####mysql -N -e "SELECT * from PortaDB.PORTAGE_DATA where PortaDB.PORTAGE_DATA.portage_id = $ID" >> $email_Body

#***************************************************************************************
#Verification des donnees inserees dans la table PORTAGE_DATA + MSISDN a porter associe
#***************************************************************************************

mysql -N -e "SELECT PortaDB.PORTAGE_DATA.*, PortaDB.PORTAGE.msisdn from PortaDB.PORTAGE_DATA inner join PortaDB.PORTAGE on PortaDB.PORTAGE.id=PortaDB.PORTAGE_DATA.portage_id where PortaDB.PORTAGE_DATA.portage_id = $ID;" >> $email_Body

echo " " >> $email_Body

done

#ssh root@vmqproportaweb01 "cat /home/porta_pnmv3/scripts/Result_msisdn_maj.txt" >> $email_Body

echo " " >> $email_Body
echo "Merci de faire les verifications necessaires."   >> $email_Body
echo " " >> $email_Body

else

afficher_trace 'Rapport sur la prochaine bascule'    
echo "==========   Rapport sur la prochaine bascule   ==========" >> $email_Body
echo "Tout est OK pour la prochaine bascule" >> $email_Body

fi

afficher_trace 'Verification integrite des informations PORTAGE_DATA'   
echo "==========   Verification integrite des informations PORTAGE_DATA   ==========" >> $email_Body

# Nb entrées en erreur dans PORTAGE_DATA
Nb_infos_KO_PORTAGE_DATA=`mysql -N -e "select count(*) from PortaDB.PORTAGE_DATA  where (item_key = 'temporary_msisdn' OR item_key IS NULL) and (trim(temporary_msisdn) = '' OR temporary_msisdn IS NULL OR length(temporary_msisdn) <> 10);"`

# Liste des entrées en erreur dans PORTAGE_DATA
Liste_infos_KO_PORTAGE_DATA=`mysql -N -e "select * from PortaDB.PORTAGE_DATA  where (item_key = 'temporary_msisdn' OR item_key IS NULL) and (trim(temporary_msisdn) = '' OR temporary_msisdn IS NULL OR length(temporary_msisdn) <> 10);"`

if [ $Nb_infos_KO_PORTAGE_DATA -eq 0 ]
then
	echo "Pas d'information erronee dans la table PORTAGE_DATA" >> $email_Body
	echo " " >> $email_Body
else 
	echo "ATTENTION! Des informations erronees sont presentes dans la table PORTAGE_DATA" >> $email_Body
	echo " " >> $email_Body
	echo "$Liste_infos_KO_PORTAGE_DATA" >> $email_Body
	echo " " >> $email_Body
	echo "Merci de faire les verifications necessaires."   >> $email_Body
	echo " " >> $email_Body
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
