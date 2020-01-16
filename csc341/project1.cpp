/*
 Minh Vu
 Becky Song
 CSC 341 W20
 Project1a: Numbers to Order

 Program description:
 This program will take a sequence of integers as input, and when the program terminates, it will out put the integers in increasing order, one per line, and each distinct integer printed just once. Afterward, programs should print "REPEAT" there are repeated values and "NO REPEATS" otherwise.

 Program instruction(Linux shell):
 To compile:
 g++ -std=c++11 project1a.cc -o project1a

 To run:
 ./project1a


*/

#include <iostream>
#include<list>
using namespace std;


//This function iterates a list of integers. If it encounters a repeated integer
//it will return "REPEAT" string and "NO REPEAT" otherwise.
string checkRepeat(list<int> l){
    string flag="NO REPEATS";
    int compare=l.back()+1;
    for (list<int>::iterator i = l.begin(); i != l.end(); i++ ){
        if(*i==compare){
            flag="REPEATS";
            return flag;
        }
        compare=*i;
    }
    return flag;
}


int main() {
    list<int> numlist;
    while(true){
        int input;
        if(cin>>input){
            numlist.push_back(input);
        }
        else{
            //This operation will sort the integer list
            numlist.sort();
            string repeat=checkRepeat(numlist);
            //This operation will delete all the repeated inegers
            numlist.unique();
            //This loop will print out every elements in the list
            for (list<int>::iterator i = numlist.begin(); i != numlist.end(); i++){
                cout << *i << endl;}
                cout << repeat << endl;
            return 0;
        }
    }

}
