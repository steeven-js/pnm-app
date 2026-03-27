#!/bin/bash
#set -x

#********************************************************#
#Reporting sur les cas de refus avec motif RIO incorrect #
#Suspicion de fraude en masse                            #
#********************************************************#

# on défini le jour de la semaime
jour=`date +%u`

# si c'est un lundi (1) on défini la date à J-3 sinon à J-1
if [ $jour -eq 1 ]
then
date=`date +%Y-%m-%d --date='-3day'`
veille=`date -d '3 day ago' +%d/%m/%Y`
else
date=`date +%Y-%m-%d --date='-1day'`
veille=`date -d '1 day ago' +%d/%m/%Y`
fi


email_From="fwi_pnm_si@digicelgroup.com"
email_Subject="[PNM] Reporting sur les cas de refus avec motif RIO incorrect - $veille"
email_To="fwi_pnm_si@digicelgroup.com  linda.haustant@digicelgroup.fr karine.bidoyet@digicelgroup.fr audrey.dorwling-carter@digicelgroup.fr teddy.moravie@digicelgroup.fr"
#email_To="Frederic.Arduin@digicelgroup.com"


#Requete de selection des porta réfusées avec le motif RIO incorrect

#Porta entrantes
nb_refus_pen=`mysql -N -e "select count(*) from PortaDB.DATA D, PortaDB.OPERATEUR O where D.operateur_origine=O.code and code_ticket = '1220' and source = 'in' and date(date_creation_ticket) = '$date' and code_motif = 'R123' UNION select 0 LIMIT 1;"`

check_refus_pen=`mysql -N -e "select upper(D.source), O.nom, count(*) from PortaDB.DATA D, PortaDB.OPERATEUR O where D.operateur_origine=O.code and code_ticket = '1220' and source = 'in' and date(date_creation_ticket) = '$date' and code_motif = 'R123' group by source, operateur_origine;"`

check_refus_msisdn_pen=`mysql -e "select PD.temporary_msisdn as msisdn_provisoire, P.msisdn as msisdn_a_porter from PortaDB.PORTAGE_DATA PD inner join PortaDB.PORTAGE P on P.id=PD.portage_id and P.id_portage in ( 
select D.id_portage from PortaDB.DATA D, PortaDB.OPERATEUR O where D.operateur_origine=O.code and code_ticket = '1220' and source = 'in' and date(date_creation_ticket) = '$date' and code_motif = 'R123' group by D.id_portage ) and PD.temporary_msisdn is not null;"`

#Porta sortantes
nb_refus_pso=`mysql -N -e "select count(*) from PortaDB.DATA D, PortaDB.OPERATEUR O where D.operateur_origine=O.code and code_ticket = '1220' and source = 'out' and date(date_creation_ticket) = '$date' and code_motif = 'R123' UNION select 0 LIMIT 1;"`

check_refus_pso=`mysql -N -e "select upper(D.source), O.nom, count(*) from PortaDB.DATA D, PortaDB.OPERATEUR O where D.operateur_origine=O.code and code_ticket = '1220' and source = 'out' and date(date_creation_ticket) = '$date' and code_motif = 'R123' group by source, operateur_origine;"`

check_refus_msisdn_pso=`mysql -e "select PD.temporary_msisdn as msisdn_provisoire, P.msisdn as msisdn_a_porter from PortaDB.PORTAGE_DATA PD inner join PortaDB.PORTAGE P on P.id=PD.portage_id and P.id_portage in ( 
select D.id_portage from PortaDB.DATA D, PortaDB.OPERATEUR O where D.operateur_origine=O.code and code_ticket = '1220' and source = 'out' and date(date_creation_ticket) = '$date' and code_motif = 'R123' group by D.id_portage ) and PD.temporary_msisdn is not null;"`

#Envoi du mail
echo "Bonjour,

Stats du $veille pour les demandes de portabilité réfusées pour motif RIO incorrect :

Il y a $nb_refus_pen cas de refus en porta entrante.
$check_refus_pen
$check_refus_msisdn_pen

Il y a $nb_refus_pso cas de refus en porta sortante.
$check_refus_pso
$check_refus_msisdn_pso

Cordialement,
APP-OCS
" | mail -a "From: $email_From" -s "$email_Subject" $email_To
#**************************************************************************

