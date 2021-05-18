/* Created by: Andre Baptista */
/* This program outputs the actor's names from the IMDB CSV filegets*/
/* Warning! There are duplicates*/

/* Workings: This program scans every line (row) of the CSV file and */
/* prints the names of every actor in that movie in a new line. */

#include <stdio.h>
#include <stdlib.h>

int main(int argc, char const *argv[]) {
  char c = getchar(); // Gets either the first line's " or EOF
  char *actors;

  while (c != EOF) {
    c = getchar(); // Gets the first [
    c = getchar(); // Gets the first character

    while (c != ']') { // Loops through the line
      if (c == '\'') {
        c = getchar();

        while (c != '\'') {
          printf("%c", c);
          c = getchar();
        }

        printf("\n");
      }
      else if (c == '\"'){
        c = getchar();
        while (c == '\"') c = getchar();

        while (c != '\"') {
          printf("%c", c);
          c = getchar();
        }

        printf("\n");
        while (c == '\"') c = getchar();
      }

      c = getchar();
    }

    c = getchar(); // Gets the last "
    c = getchar(); // Gets the new line \n
    c = getchar(); // Gets either the next line's " or EOF
    if (c == EOF) return 0;
  }
  return 0;
}
