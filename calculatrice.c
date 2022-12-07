#include <stdio.h>
int main(){
    int s ,k,m,n;
    int x;
    int k1=0;
    do{

    printf("choisir votre option \n");
    printf("1 -- nombre \t 2-- operateur \t 3--intialisation  4--EXIT\n");
    scanf("%d",&x);
      
    if(x==1){
      // if i have chosen number for the first time 
        if(k1==0){
        printf("saisie une nombre : \n");
        scanf("%d",&k);
     s=k;
     k1=1;
     }
     else if (k1==1) {
        printf("saisie une nombre :\n");
        scanf("%d",&k);
        printf("1-- addition (+) \t 2-- multiplication (*) \t 3--division (/) \t 4 --soustraction (-) \t 5 --reste(mod)  \n" );
        scanf("%d",&n) ;
        switch(n){
            case 1: printf(" %d + %d= %d\n",s,k,s+k) ;s =s+k   ;break;
            case 2: printf(" %d*%d=%d\n",s,k,s*k) ;s=s*k ;break;
            case 3: printf(" %d/%d=%d\n",s,k,s/k)  ;s=s/k ; break;
            case 4:  printf(" %d-%d=%d\n",s,k,s-k) ;s=s-k  ;break;
            case 5: printf(" %d mod %d=%d\n",s,k,s%k) ;s=s%k;break;
            default: printf(" saisie une operateur valide \n");break;
        }
     }
    }
    if(x==2){
        printf("1-- addition (+) \t 2-- multiplication (*) \t 3--division (/) \t 4 --soustraction (-) \t 5 --reste(mod)  \n" );
        scanf("%d",&n) ;
        printf("saisie une autre nombre \n");
        scanf("%d",&m);
        switch(n){
            case 1: printf(" %d + %d= %d\n",s,m,s+m) ;s =s+m   ;break;
            case 2: printf(" %d*%d=%d\n",s,m,s*m) ;s=s*m  ;break;
            case 3: printf(" %d/%d=%d\n",s,m,s/m)  ;s=s/m ; break;
            case 4:  printf(" %d-%d=%d\n",s,m,s-m) ;s=s-m  ;break;
            case 5: printf(" %d mod %d=%d\n",s,m,s%m) ;s=s%m ;break;
            default: printf(" saisie une operateur valide!!!! \n");break;
        }
        }
    if (x==3){
        s=0;
        printf("1-- addition (+) \t 2-- multiplication (*) \t 3--division (/) \t 4 --soustraction (-) \t 5 --reste(mod)  \n" );
        scanf("%d",&n) ;
        printf("saisie une autre nombre \n");
        scanf("%d",&m);
        switch(n){
            case 1: printf(" %d + %d= %d\n",s,m,s+m) ;s =s+m   ;break;
            case 2: printf(" %d*%d=%d\n",s,m,s*m) ;s=s*m  ;break;
            case 3: printf(" %d/%d=%d\n",s,m,s/m)  ;s=s/m ; break;
            case 4:  printf(" %d-%d=%d\n",s,m,s-m) ;s=s-m  ;break;
            case 5: printf(" %d mod %d=%d\n",s,m,s%m) ;s=s%m ;break;
            default: printf(" saisie une operateur valide!!!! \n");break;
        }
    }
    else if(x>4||x<0)
    {
        printf("choisir une option valide !!!!\n "); }
     } while(x!=4);
     printf("thank you  see you LATER  : )" );
return 0;
}
