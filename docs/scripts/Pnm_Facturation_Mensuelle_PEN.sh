#!/bin/bash

### Variables mail ###

#LISTE="luigi.anaclet@digicelgroup.com"
LISTE="fwi_pnm_si@digicelgroup.com jessy.lacaste@digicelgroup.fr maeva.morgar@digicelgroup.fr comptafournisseurs@digicelgroup.fr"
echo "set from = \"porta_pnmv3@fwi.digicelgroup.local\"" > /tmp/expediteur.txt  ## Email de l'expéditeur

#***************************************************************************
#Definition de la requete de selection des Porta Entrantes acceptees par OC.
#***************************************************************************

query_facturation_mensuelle_PEN_OC="SELECT 'DC' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD = 1
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage = id_portage_multiple


UNION

SELECT 'DC' AS OPR, 'MULTIPLE' AS TYPE_MANDAT, 
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI, 
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD = 1
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage != id_portage_multiple
GROUP BY id_portage_multiple;"

nb_query_facturation_mensuelle_PEN_OC="select count(*)
from
(
SELECT 'DC' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD = 1
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage = id_portage_multiple


UNION

SELECT 'DC' AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD = 1
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage != id_portage_multiple
GROUP BY id_portage_multiple
) oc
;"

#*****************************************
#Creation du fichier
cd /home/porta_pnmv3/Log;
touch Pnm_Facturation_Mensuelle_PEN_OC_`date +%Y%m%d`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PortaDB
mysql -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB << eof > Pnm_Facturation_Mensuelle_PEN_OC_`date +%Y%m%d`.xls;
$query_facturation_mensuelle_PEN_OC
eof

nb_query_facturation_mensuelle_PEN_OC=$(mysql -N -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB -e "$nb_query_facturation_mensuelle_PEN_OC");

#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,
Veuillez trouver ci-joint les elements pour la facturation liee a la portabilite depuis OC pour le mois precedent.
$nb_query_facturation_mensuelle_PEN_OC PEN seront facturees a Digicel.

Bonne reception.

Le Pole Application.
Digicel Antilles Francaise - Guyane
")  | mutt -s "[PNMV3] Facturation PEN OC -- `date -d "last month" +%Y-%B`" -F "/tmp/expediteur.txt" -a Pnm_Facturation_Mensuelle_PEN_OC_`date +%Y%m%d`.xls -- $LISTE
#**************************************************************************

#****************************************************************************
#Definition de la requete de selection des Porta Entrantes acceptees par OMT.
#****************************************************************************

query_facturation_mensuelle_PEN_OMT="SELECT 'DC' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD = 3
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage = id_portage_multiple


UNION

SELECT 'DC' AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD = 3
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage != id_portage_multiple
GROUP BY id_portage_multiple;"

nb_query_facturation_mensuelle_PEN_OMT="select count(*)
from
(
SELECT 'DC' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD = 3
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage = id_portage_multiple


UNION

SELECT 'DC' AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD = 3
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage != id_portage_multiple
GROUP BY id_portage_multiple
) omt
;"

#*****************************************
#Creation du fichier
cd /home/porta_pnmv3/Log;
touch Pnm_Facturation_Mensuelle_PEN_OMT_`date +%Y%m%d`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PortaDB
mysql -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB << eof > Pnm_Facturation_Mensuelle_PEN_OMT_`date +%Y%m%d`.xls;
$query_facturation_mensuelle_PEN_OMT
eof

nb_query_facturation_mensuelle_PEN_OMT=$(mysql -N -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB -e "$nb_query_facturation_mensuelle_PEN_OMT");
#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,
Veuillez trouver ci-joint les elements pour la facturation liee a la portabilite depuis OMT pour le mois precedent.
$nb_query_facturation_mensuelle_PEN_OMT PEN seront facturees a Digicel.

Bonne reception.

Le Pole Application.
Digicel Antilles Francaise - Guyane
")  | mutt -s "[PNMV3] Facturation PEN OMT -- `date -d "last month" +%Y-%B`" -F "/tmp/expediteur.txt" -a Pnm_Facturation_Mensuelle_PEN_OMT_`date +%Y%m%d`.xls -- $LISTE
#**************************************************************************


#****************************************************************************
#Definition de la requete de selection des Porta Entrantes acceptees par DT.
#****************************************************************************

query_facturation_mensuelle_PEN_DT="SELECT 'DC' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD = 4
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage = id_portage_multiple


UNION

SELECT 'DC' AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD =4 
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage != id_portage_multiple
GROUP BY id_portage_multiple;"

nb_query_facturation_mensuelle_PEN_DT="select count(*)
from
(
SELECT 'DC' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD = 4
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage = id_portage_multiple


UNION

SELECT 'DC' AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD =4
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage != id_portage_multiple
GROUP BY id_portage_multiple
) dt
;"

#*****************************************
#Creation du fichier
cd /home/porta_pnmv3/Log;
touch Pnm_Facturation_Mensuelle_PEN_DT_`date +%Y%m%d`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PortaDB
mysql -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB << eof > Pnm_Facturation_Mensuelle_PEN_DT_`date +%Y%m%d`.xls;
$query_facturation_mensuelle_PEN_DT
eof

nb_query_facturation_mensuelle_PEN_DT=$(mysql -N -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB -e "$nb_query_facturation_mensuelle_PEN_DT");

#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,
Veuillez trouver ci-joint les elements pour la facturation liee a la portabilite depuis DT pour le mois precedent.
$nb_query_facturation_mensuelle_PEN_DT PEN seront facturees a Digicel.

Bonne reception.

Le Pole Application.
Digicel Antilles Francaise - Guyane
")  | mutt -s "[PNMV3] Facturation PEN DT -- `date -d "last month" +%Y-%B`" -F "/tmp/expediteur.txt" -a Pnm_Facturation_Mensuelle_PEN_DT_`date +%Y%m%d`.xls -- $LISTE
#**************************************************************************

#****************************************************************************
#Definition de la requete de selection des Porta Entrantes acceptees par UTS.
#****************************************************************************

query_facturation_mensuelle_PEN_UTS="SELECT 'DC' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD = 5
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage = id_portage_multiple


UNION

SELECT 'DC' AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD =5
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage != id_portage_multiple
GROUP BY id_portage_multiple;"

nb_query_facturation_mensuelle_PEN_UTS="select count(*)
from
(
SELECT 'DC' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD = 5
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage = id_portage_multiple


UNION

SELECT 'DC' AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD =5
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage != id_portage_multiple
GROUP BY id_portage_multiple
) uts
;"

#*****************************************
#Creation du fichier
cd /home/porta_pnmv3/Log;
touch Pnm_Facturation_Mensuelle_PEN_UTS_`date +%Y%m%d`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PortaDB
mysql -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB << eof > Pnm_Facturation_Mensuelle_PEN_UTS_`date +%Y%m%d`.xls;
$query_facturation_mensuelle_PEN_UTS
eof

nb_query_facturation_mensuelle_PEN_UTS=$(mysql -N -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB -e "$nb_query_facturation_mensuelle_PEN_UTS");

#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,
Veuillez trouver ci-joint les elements pour la facturation liee a la portabilite depuis UTS pour le mois precedent.
$nb_query_facturation_mensuelle_PEN_UTS PEN seront facturees a Digicel.

Bonne reception.

Le Pole Application.
Digicel Antilles Francaise - Guyane
")  | mutt -s "[PNMV3] Facturation PEN UTS -- `date -d "last month" +%Y-%B`" -F "/tmp/expediteur.txt" -a Pnm_Facturation_Mensuelle_PEN_UTS_`date +%Y%m%d`.xls -- $LISTE
#**************************************************************************

#****************************************************************************
#Definition de la requete de selection des Porta Entrantes acceptees par FREE.
#****************************************************************************

query_facturation_mensuelle_PEN_FREE="SELECT 'DC' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD = 6
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage = id_portage_multiple


UNION

SELECT 'DC' AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD =6
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage != id_portage_multiple
GROUP BY id_portage_multiple;"

nb_query_facturation_mensuelle_PEN_FREE="select count(*)
from
(
SELECT 'DC' AS OPR, 'SIMPLE' AS TYPE_MANDAT,
id_portage AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, 1 AS NB_LIGNES, 1 AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, msisdn AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD = 6
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage = id_portage_multiple


UNION

SELECT 'DC' AS OPR, 'MULTIPLE' AS TYPE_MANDAT,
id_portage_multiple AS ID_PORTAGE, DATE_FORMAT(DATE(date_souscription), '%d/%m/%Y') AS DATE_MANDAT, COUNT(DISTINCT(id_portage)) AS NB_LIGNES, COUNT(DISTINCT(id_portage)) AS NB_LIGNES_ELI,
DATE_FORMAT(DATE(date_creation_ticket), '%d/%m/%Y') AS DATE_TRANSACTION, MAX(msisdn) AS PREMIER_NUM_ELI
FROM DATA
WHERE code_ticket = '1410'
AND OPD =6
AND OPR = 2
AND date_creation_ticket BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 MONTH)   AND CURRENT_DATE
AND id_portage != id_portage_multiple
GROUP BY id_portage_multiple
) free
;"

#*****************************************
#Creation du fichier
cd /home/porta_pnmv3/Log;
touch Pnm_Facturation_Mensuelle_PEN_FREE_`date +%Y%m%d`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PortaDB
mysql -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB << eof > Pnm_Facturation_Mensuelle_PEN_FREE_`date +%Y%m%d`.xls;
$query_facturation_mensuelle_PEN_FREE
eof

nb_query_facturation_mensuelle_PEN_FREE=$(mysql -N -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB -e "$nb_query_facturation_mensuelle_PEN_FREE");

#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,
Veuillez trouver ci-joint les elements pour la facturation liee a la portabilite depuis FREE pour le mois precedent.
$nb_query_facturation_mensuelle_PEN_FREE PEN seront facturees a Digicel.

Bonne reception.

Le Pole Application.
Digicel Antilles Francaise - Guyane
")  | mutt -s "[PNMV3] Facturation PEN FREE -- `date -d "last month" +%Y-%B`" -F "/tmp/expediteur.txt" -a Pnm_Facturation_Mensuelle_PEN_FREE_`date +%Y%m%d`.xls -- $LISTE
#**************************************************************************

rm /tmp/expediteur.txt
