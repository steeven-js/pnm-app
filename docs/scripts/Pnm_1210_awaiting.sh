#!/bin/bash

#*********************************************************************************#
#Script de verification des portages à J+1 sans 1210 à la fin de la 1ere vacation #
#*********************************************************************************#


date=`date +%d-%m-%Y`
echo "set from = \"fwi_pnm_si@digicelgroup.com\"" > /tmp/expediteur.txt  ## Email de l'expéditeur
email_Subject="[PNM] Ticket(s) 1210 en attente"
LISTE="fwi_pnm_si@digicelgroup.fr"


#*****************************************************************#
#Definition des requetes de selection des portages à J+1 sans 1210#
#*****************************************************************#

day=`mysql -N -e "select dayofweek(curdate());"`

if [ $day -eq 6 ]

then

### OC ###

req_OC_1210_awaiting="select distinct(D.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case D.OPD
when 1 then '1210'
end as 'ticket_manquant'
from PORTAGE P, DATA D
where P.etat_id_actuel = 3
and date(P.date_portage) = date(now()+INTERVAL 3 DAY)
and P.id_portage = D.id_portage
and D.OPD = '1';"

req_nb_OC_1210_awaiting=`mysql -N -e "select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 3 and date_format(PortaDB.PORTAGE.date_portage, '%Y%m%d') = curdate()+3 and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and PortaDB.DATA.OPD = '1';"`

### SFRC ###

req_SFRC_1210_awaiting="select distinct(D.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case D.OPD
when 3 then '1210'
end as 'ticket_manquant'
from PORTAGE P, DATA D
where P.etat_id_actuel = 3
and date(P.date_portage) = date(now()+INTERVAL 3 DAY)
and P.id_portage = D.id_portage
and D.OPD = '3';"

req_nb_SFRC_1210_awaiting=`mysql -N -e "select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 3 and date_format(PortaDB.PORTAGE.date_portage, '%Y%m%d') = curdate()+3 and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and PortaDB.DATA.OPD = '3';"`


### DT ###

req_DT_1210_awaiting="select distinct(D.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case D.OPD
when 4 then '1210'
end as 'ticket_manquant'
from PORTAGE P, DATA D
where P.etat_id_actuel = 3
and date(P.date_portage) = date(now()+INTERVAL 3 DAY)
and P.id_portage = D.id_portage
and D.OPD = '4';"

req_nb_DT_1210_awaiting=`mysql -N -e "select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 3 and date_format(PortaDB.PORTAGE.date_portage, '%Y%m%d') = curdate()+3 and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and PortaDB.DATA.OPD = '4';"`


### UTS ###

req_UTS_1210_awaiting="select distinct(D.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case D.OPD
when 5 then '1210'
end as 'ticket_manquant'
from PORTAGE P, DATA D
where P.etat_id_actuel = 3
and date(P.date_portage) = date(now()+INTERVAL 3 DAY)
and P.id_portage = D.id_portage
and D.OPD = '5';"

req_nb_UTS_1210_awaiting=`mysql -N -e "select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 3 and date_format(PortaDB.PORTAGE.date_portage, '%Y%m%d') = curdate()+3 and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and PortaDB.DATA.OPD = '5';"`


### FREEC ###

req_FREEC_1210_awaiting="select distinct(D.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case D.OPD
when 6 then '1210'
end as 'ticket_manquant'
from PORTAGE P, DATA D
where P.etat_id_actuel = 3
and date(P.date_portage) = date(now()+INTERVAL 3 DAY)
and P.id_portage = D.id_portage
and D.OPD = '6';"

req_nb_FREEC_1210_awaiting=`mysql -N -e "select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 3 and date_format(PortaDB.PORTAGE.date_portage, '%Y%m%d') = curdate()+3 and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and PortaDB.DATA.OPD = '6';"`


else


### OC ###

req_OC_1210_awaiting="select distinct(D.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case D.OPD
when 1 then '1210'
end as 'ticket_manquant'
from PORTAGE P, DATA D
where P.etat_id_actuel = 3
and date(P.date_portage) = date(now()+INTERVAL 1 DAY)
and P.id_portage = D.id_portage
and D.OPD = '1';"

req_nb_OC_1210_awaiting=`mysql -N -e "select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 3 and date_format(PortaDB.PORTAGE.date_portage, '%Y%m%d') = curdate()+1 and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and PortaDB.DATA.OPD = '1';"`

### SFRC ###

req_SFRC_1210_awaiting="select distinct(D.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case D.OPD
when 3 then '1210'
end as 'ticket_manquant'
from PORTAGE P, DATA D
where P.etat_id_actuel = 3
and date(P.date_portage) = date(now()+INTERVAL 1 DAY)
and P.id_portage = D.id_portage
and D.OPD = '3';"

req_nb_SFRC_1210_awaiting=`mysql -N -e "select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 3 and date_format(PortaDB.PORTAGE.date_portage, '%Y%m%d') = curdate()+1 and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and PortaDB.DATA.OPD = '3';"`


### DT ###

req_DT_1210_awaiting="select distinct(D.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case D.OPD
when 4 then '1210'
end as 'ticket_manquant'
from PORTAGE P, DATA D
where P.etat_id_actuel = 3
and date(P.date_portage) = date(now()+INTERVAL 1 DAY)
and P.id_portage = D.id_portage
and D.OPD = '4';"

req_nb_DT_1210_awaiting=`mysql -N -e "select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 3 and date_format(PortaDB.PORTAGE.date_portage, '%Y%m%d') = curdate()+1 and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and PortaDB.DATA.OPD = '4';"`


### UTS ###

req_UTS_1210_awaiting="select distinct(D.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case D.OPD
when 5 then '1210'
end as 'ticket_manquant'
from PORTAGE P, DATA D
where P.etat_id_actuel = 3
and date(P.date_portage) = date(now()+INTERVAL 1 DAY)
and P.id_portage = D.id_portage
and D.OPD = '5';"

req_nb_UTS_1210_awaiting=`mysql -N -e "select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 3 and date_format(PortaDB.PORTAGE.date_portage, '%Y%m%d') = curdate()+1 and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and PortaDB.DATA.OPD = '5';"`


### FREEC ###

req_FREEC_1210_awaiting="select distinct(D.msisdn), P.id_portage, date_format(P.date_portage, '%d-%m-%Y') as date_portage, case D.OPD
when 6 then '1210'
end as 'ticket_manquant'
from PORTAGE P, DATA D
where P.etat_id_actuel = 3
and date(P.date_portage) = date(now()+INTERVAL 1 DAY)
and P.id_portage = D.id_portage
and D.OPD = '6';"

req_nb_FREEC_1210_awaiting=`mysql -N -e "select count(distinct(PortaDB.DATA.msisdn)) from PortaDB.PORTAGE, PortaDB.DATA where PortaDB.PORTAGE.etat_id_actuel = 3 and date_format(PortaDB.PORTAGE.date_portage, '%Y%m%d') = curdate()+1 and PortaDB.PORTAGE.id_portage = PortaDB.DATA.id_portage and PortaDB.DATA.OPD = '6';"`


fi


if [ $req_nb_OC_1210_awaiting -ge 1 ]

then


#*****************************************
#Creation du fichier
touch /home/porta_pnmv3/Log/Pnm_1210_OC_awaiting_`date +%d-%m-%Y`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PORTAWEBDB
mysql -h 172.24.119.68 -u application -papplication PortaDB << eof > /home/porta_pnmv3/Log/Pnm_1210_OC_awaiting_`date +%d-%m-%Y`.xls;
$req_OC_1210_awaiting
eof
#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,

Il y a $req_nb_OC_1210_awaiting ticket(s) 1210 en attente.
Veuillez trouver ci-joint les portages en attente de reponse.


Cordialement,
Digicel Antilles Francaise - Guyane
")  | mutt -s "$email_Subject" -F "/tmp/expediteur.txt" -a /home/porta_pnmv3/Log/Pnm_1210_OC_awaiting_`date +%d-%m-%Y`.xls -- $LISTE oag.pnm-si@orange.com
#**************************************************************************

echo "Il y a $req_nb_OC_1210_awaiting ticket(s) 1210 OC en attente pour le $date"

else

echo "Pas de ticket 1210 OC en attente pour le $date"

fi

if [ $req_nb_SFRC_1210_awaiting -ge 1 ]

then


#*****************************************
#Creation du fichier
touch /home/porta_pnmv3/Log/Pnm_1210_SFRC_awaiting_`date +%d-%m-%Y`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PORTAWEBDB
mysql -h 172.24.119.68 -u application -papplication PortaDB << eof > /home/porta_pnmv3/Log/Pnm_1210_SFRC_awaiting_`date +%d-%m-%Y`.xls;
$req_SFRC_1210_awaiting
eof
#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,

Il y a $req_nb_SFRC_1210_awaiting ticket(s) 1210 en attente.
Veuillez trouver ci-joint les portages en attente de reponse.


Cordialement,
Digicel Antilles Francaise - Guyane
")  | mutt -s "$email_Subject" -F "/tmp/expediteur.txt" -a /home/porta_pnmv3/Log/Pnm_1210_SFRC_awaiting_`date +%d-%m-%Y`.xls -- $LISTE pnm@outremer-telecom.fr
#**************************************************************************

echo "Il y a $req_nb_SFRC_1210_awaiting ticket(s) 1210 SFRC en attente pour le $date"

else

echo "Pas de ticket 1210 SFRC en attente pour le $date"

fi

if [ $req_nb_DT_1210_awaiting -ge 1 ]

then


#*****************************************
#Creation du fichier
touch /home/porta_pnmv3/Log/Pnm_1210_DT_awaiting_`date +%d-%m-%Y`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PORTAWEBDB
mysql -h 172.24.119.68 -u application -papplication PortaDB << eof > /home/porta_pnmv3/Log/Pnm_1210_DT_awaiting_`date +%d-%m-%Y`.xls;
$req_DT_1210_awaiting
eof
#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,

Il y a $req_nb_DT_1210_awaiting ticket(s) 1210 en attente.
Veuillez trouver ci-joint les portages en attente de reponse.


Cordialement,
Digicel Antilles Francaise - Guyane
")  | mutt -s "$email_Subject" -F "/tmp/expediteur.txt" -a /home/porta_pnmv3/Log/Pnm_1210_DT_awaiting_`date +%d-%m-%Y`.xls -- $LISTE latifa.annachachibi@dauphintelecom.com
#**************************************************************************

echo "Il y a $req_nb_DT_1210_awaiting ticket(s) 1210 DT en attente pour le $date"

else

echo "Pas de ticket 1210 DT en attente pour le $date"

fi

if [ $req_nb_UTS_1210_awaiting -ge 1 ]

then


#*****************************************
#Creation du fichier
touch /home/porta_pnmv3/Log/Pnm_1210_UTS_awaiting_`date +%d-%m-%Y`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PORTAWEBDB
mysql -h 172.24.119.68 -u application -papplication PortaDB << eof > /home/porta_pnmv3/Log/Pnm_1210_UTS_awaiting_`date +%d-%m-%Y`.xls;
$req_UTS_1210_awaiting
eof
#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,

Il y a $req_nb_UTS_1210_awaiting ticket(s) 1210 en attente.
Veuillez trouver ci-joint les portages en attente de reponse.


Cordialement,
Digicel Antilles Francaise - Guyane
")  | mutt -s "$email_Subject" -F "/tmp/expediteur.txt" -a /home/porta_pnmv3/Log/Pnm_1210_UTS_awaiting_`date +%d-%m-%Y`.xls -- $LISTE uts-french-portability@cwc.com
#**************************************************************************

echo "Il y a $req_nb_UTS_1210_awaiting ticket(s) 1210 UTS en attente pour le $date"

else

echo "Pas de ticket 1210 UTS en attente pour le $date"

fi

if [ $req_nb_FREEC_1210_awaiting -ge 1 ]

then


#*****************************************
#Creation du fichier
touch /home/porta_pnmv3/Log/Pnm_1210_FREEC_awaiting_`date +%d-%m-%Y`.xls;
#*****************************************

#*****************************************
#Requete envoye a la DB PORTAWEBDB
mysql -h 172.24.119.68 -u application -papplication PortaDB << eof > /home/porta_pnmv3/Log/Pnm_1210_FREEC_awaiting_`date +%d-%m-%Y`.xls;
$req_FREEC_1210_awaiting
eof
#*****************************************

#**************************************************************************
#Envoi du mail
(echo "Bonjour,

Il y a $req_nb_FREEC_1210_awaiting ticket(s) 1210 en attente.
Veuillez trouver ci-joint les portages en attente de reponse.


Cordialement,
Digicel Antilles Francaise - Guyane
")  | mutt -s "$email_Subject" -F "/tmp/expediteur.txt" -a /home/porta_pnmv3/Log/Pnm_1210_FREEC_awaiting_`date +%d-%m-%Y`.xls -- $LISTE pan@fm.proxad.net
#**************************************************************************

echo "Il y a $req_nb_FREEC_1210_awaiting ticket(s) 1210 FREEC en attente pour le $date"

else

echo "Pas de ticket 1210 FREEC en attente pour le $date"

fi

rm /tmp/expediteur.txt
