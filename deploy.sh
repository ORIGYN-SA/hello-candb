NOCOLOR='\033[0m'
GREEN='\033[0;32m'
LIGHTBLUE='\033[95m'
PURPLE='\033[93m'

echo ""
date

echo -e $GREEN
echo $'\n**************************************'
echo "****** Deploy Index Canister *********"
echo $'**************************************'
echo -e $NOCOLOR

dfx deploy index

echo -e $PURPLE
echo $'\n**************************************'
echo "**** Create Service Canister *********"
echo $'**************************************'
echo -e $NOCOLOR

dfx canister create helloservice

echo -e $LIGHTBLUE
echo $'\n**************************************'
echo "**** Build Service Canister **********"
echo $'**************************************'
echo -e $NOCOLOR

dfx build helloservice

echo -e $LIGHTBLUE
echo $'\n**************************************'
echo "****** Refresh Declarations **********"
echo $'**************************************'
echo -e $NOCOLOR

dfx generate
rm -rf frontend/declarations && cp -r src/declarations frontend/declarations

echo -e $GREEN
echo $'\n**************************************'
echo "******* Hello CanDB is ready *********"
echo $'**************************************'
echo -e $NOCOLOR