#!/bin/bash
#set -x



#LISTE="rt-appli-comment@ticket.digicelgroup.fr"
LISTE="frederick.vernon@digicelgroup.com"
COPIE="sarah.mogade@digicelgroup.fR,frederic.arduin@digicelgroup.fr"

rm /tmp/FNR.html

DATE=`date +%Y%m%d`

DATE2=`date +%Y-%m-%d`

H=${DATE:6:8}

#Dossier=$1

#RT=$2

echo from: oracle@digicelgroup.fr >>/tmp/FNR.html
echo To: $LISTE >>/tmp/FNR.html
echo cc: $COPIE >>/tmp/FNR.html
echo Subject: [PNM]Presence batchhandler FNR_V3 sur EMA >>/tmp/FNR.html
echo MIME-Version: 1.0 >> /tmp/FNR.html

# Commente suite probleme post migration CERP MSC du 1er Novembre 2013
#echo "Content-Type: multipart/mixed; boundary=sep" >> /tmp/FNR.html
#echo "--sep" >> /tmp/FNR.html

echo "Content-type: text/html;" >> /tmp/FNR.html


# Chargement de l'environnement utilisateur
#*******************************************************************************
. /home/porta_pnmv3/.profile

# Procedures d'affichage ecran pour log/debug
#*******************************************************************************
function afficher_trace {
  echo "INFO_SCRIPT ($(date '+%d/%m/%Y %H:%M:%S')) : $1"
}
function afficher_erreur {
  echo "ERREUR : $1"
}
function afficher_msg {
  echo "$1"
}

# Debut d'execution
#*******************************************************************************
afficher_trace 'Debut script'


# Verification presence fichier fnr_action.bh
#*******************************************************************************
afficher_trace 'Verification presence fichier fnr_action.bh'

fnr_presence=`ssh batchusr@digimqema01 "find /global/var/sog/BatchHandler/Users/batchusr/BatchJob -name 'fnr_action_v3.bh' -type f -mtime 0"`

a=1

while [[ -z ${fnr_presence} && $a != 15 ]]

do sleep 30
fnr_presence=`ssh batchusr@digimqema01 "find /global/var/sog/BatchHandler/Users/batchusr/BatchJob -name 'fnr_action_v3.bh' -type f -mtime 0"`

let a++

done

fnr_presence=`ssh batchusr@digimqema01 "find /global/var/sog/BatchHandler/Users/batchusr/BatchJob -name 'fnr_action_v3.bh' -type f -mtime 0"`

if [ ! -z ${fnr_presence} ]
    then
        echo "Bonjour, <br></br> Le fichier fnr_action_v3.bh du jour est present. <br></br>"  >> /tmp/FNR.html
    else
        echo "Bonjour, <br></br> Merci de verifier que le transfert du fichier fnr_action_v3.bh vers EMA est effectif <br></br> Cdt,Pole Application <BR></BR>"  >> /tmp/FNR.html
        cat /tmp/FNR.html|/usr/lib/sendmail -t
        exit
fi

afficher_trace 'Fin script'

#echo "<BR></BR>" >> /tmp/FNR.html

# Mise en attente pour execution du batch sur EMA et creation du fichier log
#*******************************************************************************

#sleep 750

# Coherence fichier log
#*******************************************************************************

#log_presence=`ssh batchusr@digimqema01 "find /global/var/sog/BatchHandler/Users/batchusr/LogFiles -name '*$DATE2*fnr_action_v3.bh.log' -type f -mtime 0" | grep $H`
log_presence=`ssh batchusr@digimqema01 "find /global/var/sog/BatchHandler/Users/batchusr/LogFiles -name '*$DATE2*fnr_action_v3.bh.log' -type f -mtime 0"`

while [ -z ${log_presence} ]

do sleep 10
log_presence=`ssh batchusr@digimqema01 "find /global/var/sog/BatchHandler/Users/batchusr/LogFiles -name '*$DATE2*fnr_action_v3.bh.log' -type f -mtime 0"`

done

log_presence=`ssh batchusr@digimqema01 "find /global/var/sog/BatchHandler/Users/batchusr/LogFiles -name '*$DATE2*fnr_action_v3.bh.log' -type f -mtime 0"`

ssh batchusr@digimqema01 "scp -pr $log_presence oracle@10.118.177.16:/home/oracle/script/"

cat *fnr_action_v3.bh*  > /home/oracle/script/log/actions_fnr_v3.temp

cat /home/oracle/script/log/actions_fnr_v3.temp |grep 'Totally' | awk -F" " '{print $2}' > /home/oracle/script/log/actions_fnr_v3.log

variable1=`sed -n '1p' /home/oracle/script/log/actions_fnr_v3.log`
variable2=`sed -n '2p' /home/oracle/script/log/actions_fnr_v3.log`

total=`expr $((variable1+variable2))`

pourcentage_ok=`expr $(($((variable1*100))/$total))`

if [ ! -z ${fnr_presence} ]
    then
        if [ ! -z ${log_presence} ] && [ $pourcentage_ok -gt 50 ]
        then
                echo "Resultat des commandes OK : $pourcentage_ok% <br></br>"  >> /tmp/FNR.html
                echo "Fichier log du jour : $log_presence<br></br>" >> /tmp/FNR.html
                echo "Cdt, Pole Application" >> /tmp/FNR.html
        else
                echo "Bonjour, <br></br> Merci de véfier si le fichier log a ete cree ou s'il y a trop d'actions en echec. Resultat des commandes OK : $pourcentage_ok% <br></br> Cdt,Pole Application" >>
 /tmp/FNR.html
        fi
fi

echo "--sep" >> /tmp/FNR.html

fichier_nok=`ssh batchusr@digimqema01 "find /global/var/sog/BatchHandler/Users/batchusr/LogFiles -name '*$DATE2*fnr_action_v3.bh.nok' -type f -mtime 0 -exec cat {} \;" |tr -s ' ' '\
n' `

if test -s fichier_nok.log
    then
        if [ $pourcentage_ok -ne 100 ]
                then
                        echo "Content--Type: text/x-log; name=fnr_action_v3.bh.nok" >> /tmp/FNR.html
                        echo "Content-Disposition: attachment; filename=fnr_action_v3.bh.nok" >> /tmp/FNR.html
                        echo "" >>/tmp/FNR.html
                        echo "$fichier_nok"  >> /tmp/FNR.html

                        cat /tmp/FNR.html|/usr/lib/sendmail -t
                        rm *fnr_action_v3.bh*
                        exit
        fi
fi

cat /tmp/FNR.html|/usr/lib/sendmail -t

rm *fnr_action_v3.bh*


# Fin script
#*******************************************************************************
afficher_trace 'Fin script'


