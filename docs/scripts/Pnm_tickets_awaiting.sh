#!/bin/bash

#*********************************************************************************************************#
# Script de verification des tickets 1210 pour les portages a J+1 et des tickets 1430 et 3430 recus à S-1 #
#*********************************************************************************************************#


date=`date +%d-%m-%Y`
echo "set from = \"fwi_pnm_si@digicelgroup.com\"" > /tmp/expediteur.txt  ## Email de l'expéditeur
email_Subject="[PNM] Ticket(s) en attente"
LISTE="fwi_pnm_si@digicelgroup.fr"


##################
# ORANGE CARAIBE #
##################


#***********************************************************************#
#Definition des requetes de selection des portages en attente de tickets#
#***********************************************************************#

req_OC_tickets_awaiting="select distinct(D.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case D.OPD
when 1 then '1210'
end as 'ticket_manquant'
from PORTAGE P, DATA D
where P.etat_id_actuel = 3
and date(P.date_portage) = date(now()+INTERVAL 1 DAY)
and P.id_portage = D.id_portage
and D.OPD = '1'

UNION

select distinct(P.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case P.etat_id_actuel
when 9 then '1430'
end as 'ticket_manquant'
from PORTAGE P
where P.etat_id_actuel = 9
and date(P.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY)
and P.msisdn not in
(
select distinct(D.msisdn)
from PORTAGE P, DATA D
where P.etat_id_actuel = 9
and date(P.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY)
and P.id_portage = D.id_portage
and concat(D.code_ticket, D.operateur_origine) = '14301'
)

UNION

select distinct(msisdn) as msisdn, id_portage, date_format(date_restitution, '%d-%m-%Y') as date_portage, case code_ticket
when 3410 then '3430'
end as 'ticket_manquant'
from DATA
where code_ticket = '3410' 
and source = 'out' and OPA = '2' 
and date(date_restitution) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY)
and id_portage not in 
(select id_portage from DATA where code_ticket = '3430' and operateur_origine = '1')
;
"


req_nb_OC_tickets_awaiting=`mysql -N -e "select  ( select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 3 and date(PortaDB.PORTAGE.date_portage) = date(now()+INTERVAL 1 DAY) and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and PortaDB.DATA.OPD = '1' ) + ( select count(distinct(PortaDB.PORTAGE.msisdn)) from PortaDB.PORTAGE where PortaDB.PORTAGE.etat_id_actuel = 9 and date(PortaDB.PORTAGE.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY) and PortaDB.PORTAGE.msisdn not in ( select distinct(PortaDB.DATA.msisdn) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 9 and date(PortaDB.PORTAGE.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY) and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and concat(PortaDB.DATA.code_ticket, PortaDB.DATA.operateur_origine) = '14301' ) ) + ( select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.DATA where PortaDB.DATA.code_ticket = '3410'  and PortaDB.DATA.source = 'out' and PortaDB.DATA.OPA = '2'  and date(PortaDB.DATA.date_restitution) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY) and PortaDB.DATA.id_portage not in  (select PortaDB.DATA.id_portage from PortaDB.DATA where PortaDB.DATA.code_ticket = '3430' and PortaDB.DATA.operateur_origine = '1') ) as NB;"`


if [ $req_nb_OC_tickets_awaiting -ge 1 ]


then


#*****************************************
#Creation du fichier
touch /home/porta_pnmv3/Log/PNM_OC_Tickets_`date +%d-%m-%Y`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PORTAWEBDB
mysql -h 172.24.119.68 -u application -papplication PortaDB << eof > /home/porta_pnmv3/Log/PNM_OC_Tickets_`date +%d-%m-%Y`.xls;
$req_OC_tickets_awaiting
eof
#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,

Il y a $req_nb_OC_tickets_awaiting ticket(s) en attente.
Veuillez trouver ci-joint les portages en attente de tickets.


Cordialement,
Digicel Antilles Francaise - Guyane
")  | mutt -s "$email_Subject" -F "/tmp/expediteur.txt" -a /home/porta_pnmv3/Log/PNM_OC_Tickets_`date +%d-%m-%Y`.xls -- $LISTE oag.pnm-si@orange.com
#**************************************************************************

echo "Il y a $req_nb_OC_tickets_awaiting ticket(s) en attente."

else

echo "Pas de ticket OC en attente."

fi


###############
# SFR CARAIBE #
###############

#***********************************************************************#
#Definition des requetes de selection des portages en attente de tickets#
#***********************************************************************#

req_SFRC_tickets_awaiting="select distinct(D.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case D.OPD
when 3 then '1210'
end as 'ticket_manquant'
from PORTAGE P, DATA D
where P.etat_id_actuel = 3
and date(P.date_portage) = date(now()+INTERVAL 1 DAY)
and P.id_portage = D.id_portage
and D.OPD = '3'

UNION

select distinct(P.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case P.etat_id_actuel
when 9 then '1430'
end as 'ticket_manquant'
from PORTAGE P
where P.etat_id_actuel = 9
and date(P.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY)
and P.msisdn not in
(
select distinct(D.msisdn)
from PORTAGE P, DATA D
where P.etat_id_actuel = 9
and date(P.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY)
and P.id_portage = D.id_portage
and concat(D.code_ticket, D.operateur_origine) = '14303'
)

UNION

select distinct(msisdn) as msisdn, id_portage, date_format(date_restitution, '%d-%m-%Y') as date_portage, case code_ticket
when 3410 then '3430'
end as 'ticket_manquant'
from DATA
where code_ticket = '3410' 
and source = 'out' and OPA = '2' 
and date(date_restitution) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY)
and id_portage not in 
(select id_portage from DATA where code_ticket = '3430' and operateur_origine = '3')
;
"


req_nb_SFRC_tickets_awaiting=`mysql -N -e "select  ( select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 3 and date(PortaDB.PORTAGE.date_portage) = date(now()+INTERVAL 1 DAY) and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and PortaDB.DATA.OPD = '3' ) + ( select count(distinct(PortaDB.PORTAGE.msisdn)) from PortaDB.PORTAGE where PortaDB.PORTAGE.etat_id_actuel = 9 and date(PortaDB.PORTAGE.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY) and PortaDB.PORTAGE.msisdn not in ( select distinct(PortaDB.DATA.msisdn) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 9 and date(PortaDB.PORTAGE.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY) and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and concat(PortaDB.DATA.code_ticket, PortaDB.DATA.operateur_origine) = '14303' ) ) + ( select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.DATA where PortaDB.DATA.code_ticket = '3410'  and PortaDB.DATA.source = 'out' and PortaDB.DATA.OPA = '2'  and date(PortaDB.DATA.date_restitution) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY) and PortaDB.DATA.id_portage not in  (select PortaDB.DATA.id_portage from PortaDB.DATA where PortaDB.DATA.code_ticket = '3430' and PortaDB.DATA.operateur_origine = '3') ) as NB;"`


if [ $req_nb_SFRC_tickets_awaiting -ge 1 ]


then


#*****************************************
#Creation du fichier
touch /home/porta_pnmv3/Log/PNM_SFRC_Tickets_`date +%d-%m-%Y`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PORTAWEBDB
mysql -h 172.24.119.68 -u application -papplication PortaDB << eof > /home/porta_pnmv3/Log/PNM_SFRC_Tickets_`date +%d-%m-%Y`.xls;
$req_SFRC_tickets_awaiting
eof
#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,

Il y a $req_nb_SFRC_tickets_awaiting ticket(s) en attente.
Veuillez trouver ci-joint les portages en attente de tickets.


Cordialement,
Digicel Antilles Francaise - Guyane
")  | mutt -s "$email_Subject" -F "/tmp/expediteur.txt" -a /home/porta_pnmv3/Log/PNM_SFRC_Tickets_`date +%d-%m-%Y`.xls -- $LISTE pnm@outremer-telecom.fr
#**************************************************************************

echo "Il y a $req_nb_SFRC_tickets_awaiting ticket(s) SFRC en attente."

else

echo "Pas de ticket SFRC en attente"

fi


###################
# DAUPHIN TELECOM #
###################


#***********************************************************************#
#Definition des requetes de selection des portages en attente de tickets#
#***********************************************************************#

req_DT_tickets_awaiting="select distinct(D.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case D.OPD
when 4 then '1210'
end as 'ticket_manquant'
from PORTAGE P, DATA D
where P.etat_id_actuel = 3
and date(P.date_portage) = date(now()+INTERVAL 1 DAY)
and P.id_portage = D.id_portage
and D.OPD = '4'

UNION

select distinct(P.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case P.etat_id_actuel
when 9 then '1430'
end as 'ticket_manquant'
from PORTAGE P
where P.etat_id_actuel = 9
and date(P.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY)
and P.msisdn not in
(
select distinct(D.msisdn)
from PORTAGE P, DATA D
where P.etat_id_actuel = 9
and date(P.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY)
and P.id_portage = D.id_portage
and concat(D.code_ticket, D.operateur_origine) = '14304'
)

UNION

select distinct(msisdn) as msisdn, id_portage, date_format(date_restitution, '%d-%m-%Y') as date_portage, case code_ticket
when 3410 then '3430'
end as 'ticket_manquant'
from DATA
where code_ticket = '3410' 
and source = 'out' and OPA = '2' 
and date(date_restitution) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY)
and id_portage not in 
(select id_portage from DATA where code_ticket = '3430' and operateur_origine = '4')
;
"


req_nb_DT_tickets_awaiting=`mysql -N -e "select  ( select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 3 and date(PortaDB.PORTAGE.date_portage) = date(now()+INTERVAL 1 DAY) and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and PortaDB.DATA.OPD = '4' ) + ( select count(distinct(PortaDB.PORTAGE.msisdn)) from PortaDB.PORTAGE where PortaDB.PORTAGE.etat_id_actuel = 9 and date(PortaDB.PORTAGE.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY) and PortaDB.PORTAGE.msisdn not in ( select distinct(PortaDB.DATA.msisdn) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 9 and date(PortaDB.PORTAGE.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY) and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and concat(PortaDB.DATA.code_ticket, PortaDB.DATA.operateur_origine) = '14304' ) ) + ( select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.DATA where PortaDB.DATA.code_ticket = '3410'  and PortaDB.DATA.source = 'out' and PortaDB.DATA.OPA = '2'  and date(PortaDB.DATA.date_restitution) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY) and PortaDB.DATA.id_portage not in  (select PortaDB.DATA.id_portage from PortaDB.DATA where PortaDB.DATA.code_ticket = '3430' and PortaDB.DATA.operateur_origine = '4') ) as NB;"`


if [ $req_nb_DT_tickets_awaiting -ge 1 ]


then


#*****************************************
#Creation du fichier
touch /home/porta_pnmv3/Log/PNM_DT_Tickets_`date +%d-%m-%Y`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PORTAWEBDB
mysql -h 172.24.119.68 -u application -papplication PortaDB << eof > /home/porta_pnmv3/Log/PNM_DT_Tickets_`date +%d-%m-%Y`.xls;
$req_DT_tickets_awaiting
eof
#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,

Il y a $req_nb_DT_tickets_awaiting ticket(s) en attente.
Veuillez trouver ci-joint les portages en attente de tickets.


Cordialement,
Digicel Antilles Francaise - Guyane
")  | mutt -s "$email_Subject" -F "/tmp/expediteur.txt" -a /home/porta_pnmv3/Log/PNM_DT_Tickets_`date +%d-%m-%Y`.xls -- $LISTE latifa.annachachibi@dauphintelecom.com
#**************************************************************************

echo "Il y a $req_nb_DT_tickets_awaiting ticket(s) DT en attente."

else

echo "Pas de ticket DT en attente."

fi


###############
# UTS CARAIBE #
###############

#***********************************************************************#
#Definition des requetes de selection des portages en attente de tickets#
#***********************************************************************#

req_UTS_tickets_awaiting="select distinct(D.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case D.OPD
when 5 then '1210'
end as 'ticket_manquant'
from PORTAGE P, DATA D
where P.etat_id_actuel = 3
and date(P.date_portage) = date(now()+INTERVAL 1 DAY)
and P.id_portage = D.id_portage
and D.OPD = '5'

UNION

select distinct(P.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case P.etat_id_actuel
when 9 then '1430'
end as 'ticket_manquant'
from PORTAGE P
where P.etat_id_actuel = 9
and date(P.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY)
and P.msisdn not in
(
select distinct(D.msisdn)
from PORTAGE P, DATA D
where P.etat_id_actuel = 9
and date(P.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY)
and P.id_portage = D.id_portage
and concat(D.code_ticket, D.operateur_origine) = '14305'
)

UNION

select distinct(msisdn) as msisdn, id_portage, date_format(date_restitution, '%d-%m-%Y') as date_portage, case code_ticket
when 3410 then '3430'
end as 'ticket_manquant'
from DATA
where code_ticket = '3410' 
and source = 'out' and OPA = '2' 
and date(date_restitution) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY)
and id_portage not in 
(select id_portage from DATA where code_ticket = '3430' and operateur_origine = '5')
;
"


req_nb_UTS_tickets_awaiting=`mysql -N -e "select  ( select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 3 and date(PortaDB.PORTAGE.date_portage) = date(now()+INTERVAL 1 DAY) and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and PortaDB.DATA.OPD = '5' ) + ( select count(distinct(PortaDB.PORTAGE.msisdn)) from PortaDB.PORTAGE where PortaDB.PORTAGE.etat_id_actuel = 9 and date(PortaDB.PORTAGE.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY) and PortaDB.PORTAGE.msisdn not in ( select distinct(PortaDB.DATA.msisdn) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 9 and date(PortaDB.PORTAGE.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY) and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and concat(PortaDB.DATA.code_ticket, PortaDB.DATA.operateur_origine) = '14305' ) ) + ( select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.DATA where PortaDB.DATA.code_ticket = '3410'  and PortaDB.DATA.source = 'out' and PortaDB.DATA.OPA = '2'  and date(PortaDB.DATA.date_restitution) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY) and PortaDB.DATA.id_portage not in  (select PortaDB.DATA.id_portage from PortaDB.DATA where PortaDB.DATA.code_ticket = '3430' and PortaDB.DATA.operateur_origine = '5') ) as NB;"`


if [ $req_nb_UTS_tickets_awaiting -ge 1 ]


then


#*****************************************
#Creation du fichier
touch /home/porta_pnmv3/Log/PNM_UTS_Tickets_`date +%d-%m-%Y`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PORTAWEBDB
mysql -h 172.24.119.68 -u application -papplication PortaDB << eof > /home/porta_pnmv3/Log/PNM_UTS_Tickets_`date +%d-%m-%Y`.xls;
$req_UTS_tickets_awaiting
eof
#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,

Il y a $req_nb_UTS_tickets_awaiting ticket(s) en attente.
Veuillez trouver ci-joint les portages en attente de tickets.


Cordialement,
Digicel Antilles Francaise - Guyane
")  | mutt -s "$email_Subject" -F "/tmp/expediteur.txt" -a /home/porta_pnmv3/Log/PNM_UTS_Tickets_`date +%d-%m-%Y`.xls -- $LISTE uts-french-portability@cwc.com
#**************************************************************************

echo "Il y a $req_nb_UTS_tickets_awaiting ticket(s) UTS en attente."

else

echo "Pas de ticket UTS en attente."

fi


###############
# FREE CARAIBE #
###############

#***********************************************************************#
#Definition des requetes de selection des portages en attente de tickets#
#***********************************************************************#

req_FREE_tickets_awaiting="select distinct(D.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case D.OPD
when 6 then '1210'
end as 'ticket_manquant'
from PORTAGE P, DATA D
where P.etat_id_actuel = 3
and date(P.date_portage) = date(now()+INTERVAL 1 DAY)
and P.id_portage = D.id_portage
and D.OPD = '6'

UNION

select distinct(P.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case P.etat_id_actuel
when 9 then '1430'
end as 'ticket_manquant'
from PORTAGE P
where P.etat_id_actuel = 9
and date(P.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY)
and P.msisdn not in
(
select distinct(D.msisdn)
from PORTAGE P, DATA D
where P.etat_id_actuel = 9
and date(P.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY)
and P.id_portage = D.id_portage
and concat(D.code_ticket, D.operateur_origine) = '14306'
)

UNION

select distinct(msisdn) as msisdn, id_portage, date_format(date_restitution, '%d-%m-%Y') as date_portage, case code_ticket
when 3410 then '3430'
end as 'ticket_manquant'
from DATA
where code_ticket = '3410' 
and source = 'out' and OPA = '2' 
and date(date_restitution) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY)
and id_portage not in 
(select id_portage from DATA where code_ticket = '3430' and operateur_origine = '6')
;
"


req_nb_FREE_tickets_awaiting=`mysql -N -e "select  ( select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 3 and date(PortaDB.PORTAGE.date_portage) = date(now()+INTERVAL 1 DAY) and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and PortaDB.DATA.OPD = '6' ) + ( select count(distinct(PortaDB.PORTAGE.msisdn)) from PortaDB.PORTAGE where PortaDB.PORTAGE.etat_id_actuel = 9 and date(PortaDB.PORTAGE.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY) and PortaDB.PORTAGE.msisdn not in ( select distinct(PortaDB.DATA.msisdn) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 9 and date(PortaDB.PORTAGE.date_portage) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY) and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and concat(PortaDB.DATA.code_ticket, PortaDB.DATA.operateur_origine) = '14306' ) ) + ( select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.DATA where PortaDB.DATA.code_ticket = '3410'  and PortaDB.DATA.source = 'out' and PortaDB.DATA.OPA = '2'  and date(PortaDB.DATA.date_restitution) between date(now()-INTERVAL 1 WEEK) and date(now()-INTERVAL 3 DAY) and PortaDB.DATA.id_portage not in  (select PortaDB.DATA.id_portage from PortaDB.DATA where PortaDB.DATA.code_ticket = '3430' and PortaDB.DATA.operateur_origine = '6') ) as NB;"`


if [ $req_nb_FREE_tickets_awaiting -ge 1 ]


then


#*****************************************
#Creation du fichier
touch /home/porta_pnmv3/Log/PNM_FREE_Tickets_`date +%d-%m-%Y`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PORTAWEBDB
mysql -h 172.24.119.68 -u application -papplication PortaDB << eof > /home/porta_pnmv3/Log/PNM_FREE_Tickets_`date +%d-%m-%Y`.xls;
$req_FREE_tickets_awaiting
eof
#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,

Il y a $req_nb_FREE_tickets_awaiting ticket(s) en attente.
Veuillez trouver ci-joint les portages en attente de tickets.


Cordialement,
Digicel Antilles Francaise - Guyane
")  | mutt -s "$email_Subject" -F "/tmp/expediteur.txt" -a /home/porta_pnmv3/Log/PNM_FREE_Tickets_`date +%d-%m-%Y`.xls -- $LISTE pan@fm.proxad.net
#**************************************************************************

echo "Il y a $req_nb_FREE_tickets_awaiting ticket(s) FREE en attente."

else

echo "Pas de ticket FREE en attente."

fi

rm /tmp/expediteur.txt
