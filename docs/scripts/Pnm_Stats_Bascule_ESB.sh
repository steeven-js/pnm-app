#!/bin/bash

#Identification du jour férié ou pas

ferryday=`mysql -N -e "select count(*) from PortaDB.FERRYDAY where PortaDB.FERRYDAY.ferryday = curdate();"`

#*************************************************************************
#Definition de la requete de selection des statistiques ESB pour la porta.
#*************************************************************************

query_esb_stats_porta="SELECT PWS_ACTION, IS_SUCCESS, COUNT(*) \"NB CALL\" FROM 
LOGGER.LOG_ITEM
WHERE CREATION_DATE > SUBSTRING(now(),1,10)
AND TYPE LIKE 'nativeFrontend'
AND PWS_SYSTEM LIKE 'PORTA'
GROUP BY PWS_ACTION, IS_SUCCESS;"

#*****************************************
#Creation du fichier
touch Log/Pnm_Stats_ESB_`date +%Y%m%d`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB ESB
mysql -h 172.24.5.48 -u application -papplication LOGGER << eof > Log/Pnm_Stats_ESB_`date +%Y%m%d`.xls;
$query_esb_stats_porta
eof
#*****************************************

#**************************************************************************
#Envoi du mail

if [ $ferryday -eq 1 ]
then
(echo "Bonjour,

Veuillez trouver ci-joint les statistiques concernant la porta de ce jour.
A noter qu'il s'agit d'un jour ferie. Il n'y aura donc pas de portabilite.


Le Pole Application.
Digicel Antilles Francaise - Guyane
" ; uuencode Log/Pnm_Stats_ESB_`date +%Y%m%d`.xls Log/Pnm_Stats_ESB_`date +%Y%m%d`.xls)  | mail -a "FROM: porta_pnmv3@fwi.digicelgroup.local" -s "[PNMV3] Stats ESB Porta" fwi_pnm_si@digicelgroup.com;

else

(echo "Bonjour,

Veuillez trouver ci-joint les statistiques concernant la porta de ce jour.


Le Pole Application.
Digicel Antilles Francaise - Guyane
" ; uuencode Log/Pnm_Stats_ESB_`date +%Y%m%d`.xls Log/Pnm_Stats_ESB_`date +%Y%m%d`.xls)  | mail -a "FROM: porta_pnmv3@fwi.digicelgroup.local" -s "[PNMV3] Stats ESB Porta" fwi_pnm_si@digicelgroup.com;

fi

#**************************************************************************

#*************************************************************************
#Definition de la requete de selection des MSISDN bascules sur  ESB.
#*************************************************************************

query_esb_bascule_msisdn="SELECT PWS_ACTION, REQ_DATE, IS_SUCCESS, SUBSTRING(SUBSTRING_INDEX
(REQUEST,'<msisdn>',-1),1,12) \"Msisdn\", SUBSTRING(SUBSTRING_INDEX
(REQUEST,'<newMsisdn>',-1),1,12) \"New Msisdn\" FROM LOGGER.LOG_ITEM 
WHERE 
CREATION_DATE > SUBSTRING(now(),1,10) 
and (PWS_ACTION LIKE 'UpdateMsisdn' or PWS_ACTION 
LIKE 'TerminateLine' or PWS_ACTION LIKE 'UpdateLineMsisdn')
and TYPE LIKE 'nativeFrontend'
and PWS_SYSTEM LIKE 'PORTA'
ORDER BY PWS_ACTION;"

#*****************************************
#Creation du fichier
touch Log/Pnm_Bascule_Msisdn_ESB_`date +%Y%m%d`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB ESB
mysql -h 172.24.5.48 -u application -papplication LOGGER << eof > Log/Pnm_Bascule_Msisdn_ESB_`date +%Y%m%d`.xls;
$query_esb_bascule_msisdn
eof
#*****************************************

#**************************************************************************
#Envoi du mail
if [ $ferryday -eq 1 ]
then
(echo "Bonjour,

Veuillez trouver ci-joint le detail des MSISDN portes ce jour.
A noter qu'il s'agit d'un jour ferie. Il n'y aura donc pas de portabilite.


Le Pole Application.
Digicel Antilles Francaise - Guyane
" ; uuencode Log/Pnm_Bascule_Msisdn_ESB_`date +%Y%m%d`.xls Log/Pnm_Bascule_Msisdn_ESB_`date +%Y%m%d`.xls)  | mail -a "FROM: porta_pnmv3@fwi.digicelgroup.local" -s "[PNMV3] Bascule MSISDN ESB Porta" fwi_pnm_si@digicelgroup.com;

else

(echo "Bonjour,
Veuillez trouver ci-joint le detail des MSISDN portes ce jour.


Bonne reception.

Le Pole Application.
Digicel Antilles Francaise - Guyane
" ; uuencode Log/Pnm_Bascule_Msisdn_ESB_`date +%Y%m%d`.xls Log/Pnm_Bascule_Msisdn_ESB_`date +%Y%m%d`.xls)  | mail -a "FROM: porta_pnmv3@fwi.digicelgroup.local" -s "[PNMV3] Bascule MSISDN ESB Porta" fwi_pnm_si@digicelgroup.com;

fi

#**************************************************************************

#*************************************************************************
#Definition de la requete de selection des PSO sur  ESB.
#*************************************************************************
#query_esb_logger_pso_prod="SELECT DISTINCT(LOG1.ID) \"Id\" , LOG1.PWS_ACTION,
#CONCAT('N_', SUBSTRING_INDEX(SUBSTRING_INDEX(LOG1.REQUEST,'<msisdn>',-1),'</msisdn>',1)) \"N de mobile\",
#SUBSTRING_INDEX(SUBSTRING_INDEX(LOG2.RESPONSE,'CUSTOMER_NO>',-2),'<',1) \"Code client\",
#SUBSTRING_INDEX(SUBSTRING_INDEX(LOG2.RESPONSE,'CUSTOMER_TYPE>',-2),'<',1) \"Type de client\",
#SUBSTRING_INDEX(SUBSTRING_INDEX(LOG2.RESPONSE,'DOSSIER_NO>',-2),'<',1) \"N de dossier\",
#SUBSTRING_INDEX(SUBSTRING_INDEX(LOG2.RESPONSE,'LINE_NO>',-2),'<',1) \"N de ligne\",
#SUBSTRING_INDEX(SUBSTRING_INDEX(LOG2.RESPONSE,'date_fin_abo>',-2),'T',1) \"Date de fin engagement\"
#FROM LOGGER.LOG_ITEM LOG1, LOGGER.LOG_ITEM LOG2 
#WHERE 
#LOG1.CREATION_DATE > SUBSTRING(now(),1,10) 
#and LOG2.CREATION_DATE > SUBSTRING(now()-INTERVAL 60 DAY,1,10) 
#and LOG1.PWS_ACTION LIKE 'TerminateLine' 
#and LOG2.PWS_ACTION LIKE 'InfoLine'
#and LOG1.IS_SUCCESS LIKE 'yes'
#and LOG1.TYPE LIKE 'nativeFrontend'
#and LOG1.PWS_SYSTEM LIKE 'PORTA'
#and SUBSTRING(SUBSTRING_INDEX(LOG2.RESPONSE,'MSISDN_NAT>',-2),2,9) LIKE SUBSTRING(SUBSTRING_INDEX(LOG1.REQUEST,'<msisdn>',-1),4,9);"

#*****************************************
#Creation du fichier
#touch Log/Pnm_PSO_ESB_`date +%Y%m%d`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB ESB
#mysql -h 172.24.5.48 -u application -papplication LOGGER << eof > Log/Pnm_PSO_ESB_`date +%Y%m%d`.xls;
#$query_esb_logger_pso_prod
#eof
#*****************************************

#**************************************************************************
#Envoi du mail
#(echo "Bonjour,
#Veuillez trouver ci-joint le detail des PSO du jour.
##
#Bonne reception.
#
#Le Pole Application.
#Digicel Antilles Francaise - Guyane
#" ; uuencode Log/Pnm_PSO_ESB_`date +%Y%m%d`.xls Log/Pnm_PSO_ESB_`date +%Y%m%d`.xls) | mail -a "FROM: porta_pnmv3@fwi.digicelgroup.local" -s "[PNMV3] PSO du jour" fwi_pnm_si@digicelgroup.com;
#**************************************************************************
