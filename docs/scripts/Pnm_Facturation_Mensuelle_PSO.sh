#!/bin/bash

### Variables mail ###

#LISTE="luigi.anaclet@digicelgroup.com"
LISTE="fwi_pnm_si@digicelgroup.com jessy.lacaste@digicelgroup.fr maeva.morgar@digicelgroup.fr compta.clients@digicelgroup.fr"
echo "set from = \"porta_pnmv3@fwi.digicelgroup.local\"" > /tmp/expediteur.txt  ## Email de l'expéditeur

#************************************************************************************
#Definition de la requete de selection des Porta Sortantes vers OC que DC a acceptee.
#************************************************************************************

query_facturation_mensuelle_PSO_OC="SELECT 'OC' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 1
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)    AND CURRENT_DATE -1
AND id_portage = id_portage_multiple

UNION

SELECT 'OC'AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI, 
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 1
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)    AND CURRENT_DATE -1
AND id_portage != id_portage_multiple
GROUP BY date_creation_ticket, id_portage_multiple;"

nb_query_facturation_mensuelle_PSO_OC="select count(*)
from
(
SELECT 'OC' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 1
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)    AND CURRENT_DATE -1
AND id_portage = id_portage_multiple

UNION

SELECT 'OC'AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI, 
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 1
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)    AND CURRENT_DATE -1
AND id_portage != id_portage_multiple
GROUP BY date_creation_ticket, id_portage_multiple
) oc
;"

#*****************************************
#Creation du fichier
cd /home/porta_pnmv3/Log;
touch Pnm_Facturation_Mensuelle_PSO_OC_`date +%Y%m%d`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PortaDB
mysql -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB << eof > Pnm_Facturation_Mensuelle_PSO_OC_`date +%Y%m%d`.xls;
$query_facturation_mensuelle_PSO_OC
eof


#touch pso_oc.txt;

nb_query_facturation_mensuelle_PSO_OC=$(mysql -N -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB -e "$nb_query_facturation_mensuelle_PSO_OC");
#$nb_query_facturation_mensuelle_PSO_OC
#eof

#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,
Veuillez trouver ci-joint les elements pour la facturation liee a la portabilite sortante vers OC pour le mois precedent.
$nb_query_facturation_mensuelle_PSO_OC PSO a facturer par Digicel.

Bonne reception.

Le Pole Application.
Digicel Antilles Francaise - Guyane
") | mutt -s "[PNMV3] Facturation PSO OC -- `date -d "last month" +%Y-%B`" -F "/tmp/expediteur.txt" -a Pnm_Facturation_Mensuelle_PSO_OC_`date +%Y%m%d`.xls -- $LISTE
#**************************************************************************

#*************************************************************************************
#Definition de la requete de selection des Porta Sortantes vers OMT que DC a acceptee.
#*************************************************************************************

query_facturation_mensuelle_PSO_OMT="SELECT 'OMT' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 3 
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)    AND CURRENT_DATE -1
AND id_portage = id_portage_multiple

UNION

SELECT 'OMT'AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 3 
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)    AND CURRENT_DATE -1
AND id_portage != id_portage_multiple
GROUP BY date_creation_ticket, id_portage_multiple;"

nb_query_facturation_mensuelle_PSO_OMT="select count(*)
from
(
SELECT 'OMT' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 3
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)    AND CURRENT_DATE -1
AND id_portage = id_portage_multiple

UNION

SELECT 'OMT'AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 3
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)    AND CURRENT_DATE -1
AND id_portage != id_portage_multiple
GROUP BY date_creation_ticket, id_portage_multiple
) omt
;"

#*****************************************
#Creation du fichier
cd /home/porta_pnmv3/Log;
touch Pnm_Facturation_Mensuelle_PSO_OMT_`date +%Y%m%d`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PortaDB
mysql -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB << eof > Pnm_Facturation_Mensuelle_PSO_OMT_`date +%Y%m%d`.xls;
$query_facturation_mensuelle_PSO_OMT
eof

nb_query_facturation_mensuelle_PSO_OMT=$(mysql -N -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB -e "$nb_query_facturation_mensuelle_PSO_OMT");

#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,
Veuillez trouver ci-joint les elements pour la facturation liee a la portabilite sortante vers OMT pour le mois precedent.
$nb_query_facturation_mensuelle_PSO_OMT PSO a facturer par Digicel.

Bonne reception.

Le Pole Application.
Digicel Antilles Francaise - Guyane
")  | mutt -s "[PNMV3] Facturation PSO OMT -- `date -d "last month" +%Y-%B`" -F "/tmp/expediteur.txt" -a Pnm_Facturation_Mensuelle_PSO_OMT_`date +%Y%m%d`.xls -- $LISTE
#**************************************************************************

#************************************************************************************
#Definition de la requete de selection des Porta Sortantes vers DT que DC a acceptee.
#************************************************************************************

query_facturation_mensuelle_PSO_DT="SELECT 'DT' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 4 
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE -1
AND id_portage = id_portage_multiple

UNION

SELECT 'DT'AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 4
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE -1
AND id_portage != id_portage_multiple
GROUP BY date_creation_ticket, id_portage_multiple;"


nb_query_facturation_mensuelle_PSO_DT="select count(*)
from
(
SELECT 'DT' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 4
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE -1
AND id_portage = id_portage_multiple

UNION

SELECT 'DT'AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 4
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE -1
AND id_portage != id_portage_multiple
GROUP BY date_creation_ticket, id_portage_multiple
) dt
;"
#*****************************************
#Creation du fichier
cd /home/porta_pnmv3/Log;
touch Pnm_Facturation_Mensuelle_PSO_DT_`date +%Y%m%d`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PortaDB
mysql -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB << eof > Pnm_Facturation_Mensuelle_PSO_DT_`date +%Y%m%d`.xls;
$query_facturation_mensuelle_PSO_DT
eof

nb_query_facturation_mensuelle_PSO_DT=$(mysql -N -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB -e "$nb_query_facturation_mensuelle_PSO_DT");

#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,
Veuillez trouver ci-joint les elements pour la facturation liee a la portabilite sortante vers DT pour le mois precedent.
$nb_query_facturation_mensuelle_PSO_DT PSO a facturer par Digicel.

Bonne reception.

Le Pole Application.
Digicel Antilles Francaise - Guyane
")  | mutt -s "[PNMV3] Facturation PSO DT -- `date -d "last month" +%Y-%B`" -F "/tmp/expediteur.txt" -a Pnm_Facturation_Mensuelle_PSO_DT_`date +%Y%m%d`.xls -- $LISTE
#**************************************************************************

#*************************************************************************************
#Definition de la requete de selection des Porta Sortantes vers UTS que DC a acceptee.
#*************************************************************************************

query_facturation_mensuelle_PSO_UTS="SELECT 'UTS' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 5 
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE -1
AND id_portage = id_portage_multiple

UNION

SELECT 'UTS' AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 5
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE -1
AND id_portage != id_portage_multiple
GROUP BY date_creation_ticket, id_portage_multiple;"

nb_query_facturation_mensuelle_PSO_UTS="select count(*)
from
(
SELECT 'UTS' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 5
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE -1
AND id_portage = id_portage_multiple

UNION

SELECT 'UTS' AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 5
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE -1
AND id_portage != id_portage_multiple
GROUP BY date_creation_ticket, id_portage_multiple
) uts
;"

#*****************************************
#Creation du fichier
cd /home/porta_pnmv3/Log;
touch Pnm_Facturation_Mensuelle_PSO_UTS_`date +%Y%m%d`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PortaDB
mysql -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB << eof > Pnm_Facturation_Mensuelle_PSO_UTS_`date +%Y%m%d`.xls;
$query_facturation_mensuelle_PSO_UTS
eof

nb_query_facturation_mensuelle_PSO_UTS=$(mysql -N -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB -e "$nb_query_facturation_mensuelle_PSO_UTS");
echo "$nb_query_facturation_mensuelle_PSO_UTS"
#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,
Veuillez trouver ci-joint les elements pour la facturation liee a la portabilite sortante vers UTS pour le mois precedent.
$nb_query_facturation_mensuelle_PSO_UTS PSO a facturer par Digicel.

Bonne reception.

Le Pole Application.
Digicel Antilles Francaise - Guyane
")  | mutt -s "[PNMV3] Facturation PSO UTS -- `date -d "last month" +%Y-%B`" -F "/tmp/expediteur.txt" -a Pnm_Facturation_Mensuelle_PSO_UTS_`date +%Y%m%d`.xls -- $LISTE
#**************************************************************************

#*************************************************************************************
#Definition de la requete de selection des Porta Sortantes vers FREE que DC a acceptee.
#*************************************************************************************

query_facturation_mensuelle_PSO_FREE="SELECT 'FREE' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 6 
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE -1
AND id_portage = id_portage_multiple

UNION

SELECT 'FREE' AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 6
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE -1
AND id_portage != id_portage_multiple
GROUP BY date_creation_ticket, id_portage_multiple;"

nb_query_facturation_mensuelle_PSO_FREE="select count(*)
from
(
SELECT 'FREE' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 6
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE -1
AND id_portage = id_portage_multiple

UNION

SELECT 'FREE' AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1210'
AND OPR = 6
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE -1
AND id_portage != id_portage_multiple
GROUP BY date_creation_ticket, id_portage_multiple
) free
;"

#*****************************************
#Creation du fichier
cd /home/porta_pnmv3/Log;
touch Pnm_Facturation_Mensuelle_PSO_FREE_`date +%Y%m%d`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PortaDB
mysql -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB << eof > Pnm_Facturation_Mensuelle_PSO_FREE_`date +%Y%m%d`.xls;
$query_facturation_mensuelle_PSO_FREE
eof

nb_query_facturation_mensuelle_PSO_FREE=$(mysql -N -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB -e "$nb_query_facturation_mensuelle_PSO_FREE");

#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,
Veuillez trouver ci-joint les elements pour la facturation liee a la portabilite sortante vers FREE pour le mois precedent.
$nb_query_facturation_mensuelle_PSO_FREE PSO a facturer par Digicel.

Bonne reception.

Le Pole Application.
Digicel Antilles Francaise - Guyane
")  | mutt -s "[PNMV3] Facturation PSO FREE -- `date -d "last month" +%Y-%B`" -F "/tmp/expediteur.txt" -a Pnm_Facturation_Mensuelle_PSO_FREE_`date +%Y%m%d`.xls -- $LISTE
#**************************************************************************

rm /tmp/expediteur.txt
