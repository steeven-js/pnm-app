#!/bin/bash

#################### Script de vérification des portabilités entrantes à année -1 ####################

### Variables mail ###

#LISTE="frederic.arduin@digicelgroup.com"
LISTE="fwi_pnm_si@digicelgroup.com"
YEAR=`date -d "last year" +%Y`

echo "set from = \"porta_pnmv3@fwi.digicelgroup.local\"" > /tmp/expediteur.txt  ## Email de l'expéditeur

#***************************************************************************
#Definition de la requete de selection des Porta Entrantes acceptees par OC.
#***************************************************************************

query_facturation_annuelle_PEN="select OPERATEUR_DONNEUR, SUM(NOMBRE) as NOMBRE
from
(
select case OPD
when 1 then 'OC'
when 3 then 'SFRC'
when 4 then 'DT'
when 5 then 'UTS'
when 6 then 'FREEC'
end as 'OPERATEUR_DONNEUR',
count(distinct (id_portage)) as NOMBRE
FROM DATA
WHERE code_ticket = '1410'
AND OPD in (1,3,4,5,6)
AND OPR = 2
AND date(date_creation_ticket) BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 YEAR) AND CURRENT_DATE
AND id_portage = id_portage_multiple
group by OPD

UNION

select case OPD
when 1 then 'OC'
when 3 then 'SFRC'
when 4 then 'DT'
when 5 then 'UTS'
when 6 then 'FREEC'
end as 'OPERATEUR_DONNEUR',
count(distinct (id_portage_multiple)) as NOMBRE
FROM DATA
WHERE code_ticket = '1410'
AND OPD in (1,3,4,5,6)
AND OPR = 2
AND date(date_creation_ticket) BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 YEAR) AND CURRENT_DATE
AND id_portage != id_portage_multiple
group by OPD
) t
group by OPERATEUR_DONNEUR
order by NOMBRE desc
;"

nb_query_facturation_annuelle_PEN="select SUM(NOMBRE) as NOMBRE
from
(
select count(distinct (id_portage)) as NOMBRE
FROM DATA
WHERE code_ticket = '1410'
AND OPD in (1,3,4,5,6)
AND OPR = 2
AND date(date_creation_ticket) BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 YEAR) AND CURRENT_DATE
AND id_portage = id_portage_multiple

UNION

select count(distinct (id_portage_multiple)) as NOMBRE
FROM DATA
WHERE code_ticket = '1410'
AND OPD in (1,3,4,5,6)
AND OPR = 2
AND date(date_creation_ticket) BETWEEN SUBDATE(CURRENT_TIMESTAMP, INTERVAL 1 YEAR) AND CURRENT_DATE
AND id_portage != id_portage_multiple
group by OPD
) t
;"

#*****************************************
#Requete envoye a la DB PortaDB

req_nb_query_facturation_annuelle_PEN=$(mysql -N -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB -e "$nb_query_facturation_annuelle_PEN");
req_query_facturation_annuelle_PEN=$(mysql -N -h 172.24.119.68 -u exploit -pmdpalc03 PortaDB -e "$query_facturation_annuelle_PEN");

#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,

Veuillez trouver, ci-joint, les éléments pour la facturation liée à la portabilité entrante pour l'année $YEAR.
$req_nb_query_facturation_annuelle_PEN PEN ont été facturées à Digicel.

$req_query_facturation_annuelle_PEN

Bonne réception.

L'équipe Application.
Digicel Antilles Francaise - Guyane
")  | mutt -s "[PNMV3] Facturation PEN globale sur l'année $YEAR" -F "/tmp/expediteur.txt" -- $LISTE
#**************************************************************************


rm /tmp/expediteur.txt
