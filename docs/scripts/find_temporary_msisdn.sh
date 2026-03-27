# Script  : Extraction MSISDN temporaire - PNMV3
# Auteur  : FAR-FVE
# Version : 10-01-2017
#******************************************************************************
#!/bin/bash
# Chargement de l'environnement utilisateur
#*******************************************************************************
#. /u/home/bcd/production/.profile

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

afficher_trace 'Debut script'

cd /home/porta_pnmv3/scripts

#set -x

touch Result_msisdn.txt

echo "========================" >> Result_msisdn.txt
echo "MSISDN        / MSISDN_TEMP" >> Result_msisdn.txt
echo "========================" >> Result_msisdn.txt

#*************************************************************************
# Extraire Nom/Numero de ligne dans fichier log (erreur E610)
#*************************************************************************

for ID_PORTAGE in $(cat Id_portage.txt)

do

NOM_FICHIER=`grep "R220.*$ID_PORTAGE\|E610.*$ID_PORTAGE" /usr/glassfish4/glassfish/domains/domain1/logs/* | tail -1 | awk -F ":" '{print $1}'`

#for MSISDN in $(cat Liste_num.txt)

#do 

if [ -z "$NOM_FICHIER" ]

then

echo "$MSISDN / ERREUR" >> Result_msisdn.txt

else

#echo $NOM_FICHIER

NUM_LINE=`grep -n "R220.*$ID_PORTAGE\|E610.*$ID_PORTAGE" /usr/glassfish4/glassfish/domains/domain1/logs/* | tail -1 | awk -F ":" '{print $2}'`

#echo $NUM_LINE

NUM_MAX=$(expr $NUM_LINE + 100)

#echo $NUM_MAX
#*********************************************************************************************************
# Recherche numero temporaire du GET line information suivant l'erreur E610 - suppression retour chariot
#*********************************************************************************************************

TEMP=`cat $NOM_FICHIER |  sed -n ''"$NUM_LINE"','"$NUM_MAX"'p' |awk -F "<msisdn>" '{print $2}' | awk -F "</msisdn>" '{print $1}' | grep -v "^$"| tail -1`

#echo $TEMP

TEMP_NAT=`echo "0${TEMP:3:$((${#TEMP}-0))}"`

#echo $TEMP_NAT

echo "$MSISDN / $TEMP_NAT" >> Result_msisdn.txt

#cat Result_msisdn.txt

fi

#done

done

mv Result_msisdn.txt Result_msisdn_maj.txt

afficher_trace 'Fin script'
