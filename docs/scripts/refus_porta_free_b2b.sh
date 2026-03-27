#!/bin/bash

#******************************************************#
#Script de gestion pour les portabilités B2B vers Free #
#******************************************************#


date=`date +%d-%m-%Y_%T`
email_From="fwi_pnm_si@digicelgroup.com"
email_Subject="[PNM] Gestion des portabilités B2B vers Free Caraïbe"
email_To="fwi_pnm_si@digicelgroup.com elisabeth.ozierlafontaine@digicelgroup.com"
#email_To="Frederic.Arduin@digicelgroup.com"
#full_date=`date +%Y%m%d%H%M%S`


#Requete de selection des MSISDN

msisdn_free_b2b=`mysql -N -e "select msisdn from PortaDB.PORTAGE where id_portage in ( select id_portage from PortaDB.DATA where 1=1 and source = 'in' and code_ticket in ('1110','1120') and operateur_origine = 6 and rio like '02E%' ) and etat_id_actuel = 15 and date_fin is null;"`

nb_msisdn_free_b2b=`mysql -N -e "select count(msisdn) from PortaDB.PORTAGE where id_portage in ( select id_portage from PortaDB.DATA where 1=1 and source = 'in' and code_ticket in ('1110','1120') and operateur_origine = 6 and rio like '02E%' ) and etat_id_actuel = 15 and date_fin is null;"`


if [ $nb_msisdn_free_b2b -ge 1 ]

then

update_statut_free_b2b=`mysql -N -e "update PortaDB.PORTAGE set etat_id_actuel = 17 where id_portage in ( select id_portage from PortaDB.DATA where 1=1 and source = 'in' and code_ticket in ('1110','1120') and operateur_origine = 6 and rio like '02E%' ) and etat_id_actuel = 15 and date_fin is null; commit;"`

#Envoi du mail
echo "Bonjour,

Il y a $nb_msisdn_free_b2b nouvelle(s) demande(s) de portabilité B2B vers Free en cours.

MSISDN:
$msisdn_free_b2b

Blocage effectué en base de données.

Cordialement,
APP-OCS
" | mail -a "From: $email_From" -s "$email_Subject" $email_To
#**************************************************************************

echo "$date - Il y a $nb_msisdn_free_b2b porta B2B vers Free"

else

echo "$date - Pas de porta B2B vers Free"

fi
