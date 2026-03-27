#!/bin/bash

#******************************************************************************************************************************************#
#Script de verification des tickets 1110 transmis à UTS afin de créer le fichier contenant le ticket 1210 d'UTS à intégrer en mode dégradé #
#******************************************************************************************************************************************#


date=`date +%d-%m-%Y`
email_From="fwi_pnm_si@digicelgroup.com"
email_Subject="[PNM] Ticket(s) 1110 transmis a UTS -> fichier a creer avec le(s) ticket(s) 1210 d'UTS"
email_To="fwi_pnm_si@digicelgroup.com"
#email_To="Frederic.Arduin@digicelgroup.com"
#full_date=`date +%Y%m%d%H%M%S`


#Requete de selection des MSISDN

ticket_1110_DC_to_UTS=`mysql -N -e "select msisdn from PortaDB.DATA where PortaDB.DATA.code_ticket = 1110 and PortaDB.DATA.operateur_origine = 2 and PortaDB.DATA.operateur_destination = 5 and PortaDB.DATA.source = 'out' and PortaDB.DATA.date_creation_ticket between DATE_ADD(NOW(), INTERVAL -2 HOUR) and NOW();"`

nb_ticket_1110_DC_to_UTS=`mysql -N -e "select count(msisdn) from PortaDB.DATA where PortaDB.DATA.code_ticket = 1110 and PortaDB.DATA.operateur_origine = 2 and PortaDB.DATA.operateur_destination = 5 and PortaDB.DATA.source = 'out' and PortaDB.DATA.date_creation_ticket between DATE_ADD(NOW(), INTERVAL -2 HOUR) and NOW();"`


if [ $nb_ticket_1110_DC_to_UTS -ge 1 ]

then

#Envoi du mail
echo "Bonjour,

Il y a $nb_ticket_1110_DC_to_UTS ticket(s) 1110 transmis a UTS.
Veuillez generer un fichier de vacation a integrer en mode degrade contenant le(s) ticket(s) 1210 d'UTS.
Transmettre le fichier cree a UTS.


Cordialement,
Digicel Antilles Francaise - Guyane
" | mail -a "From: $email_From" -s "$email_Subject" $email_To
#**************************************************************************

echo "$date - Il y a $nb_ticket_1110_DC_to_UTS ticket(s) 1110 transmis a UTS"

else

echo "$date - Pas de ticket 1110 transmis a UTS"

fi
