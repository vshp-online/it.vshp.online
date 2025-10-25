C************************************************************************
C     HUFFMAN ENCODING ALGORITHM
C     WRITTEN BY: PAVEL TKACHEV
C     BASED ON METHODS FROM:
C     "NUMERICAL RECIPES IN FORTRAN 77: VOL 1", 1992
C     ADAPTED AND SIMPLIFIED FOR STUDENTS.
C     CONTACT: PHOENIXWEISS@YA.RU
C     DATE: DECEMBER 2024
C************************************************************************

      PROGRAM HUFFMAN
      IMPLICIT NONE

C     Constants for array sizes and large integer value
      INTEGER MAXSYM, MAXNOD, MAXINT
      PARAMETER (MAXSYM = 256, MAXNOD = 512, MAXINT = 999999999)

C     Arrays for frequencies, tree structure, and parent nodes
      INTEGER FREQ(MAXNOD)
      INTEGER LEFT(MAXNOD)
      INTEGER RIGHT(MAXNOD)
      INTEGER PARENT(MAXNOD)

C     Variables for input processing and Huffman tree construction
      INTEGER CHRCOD, LEN, N, NDS
      INTEGER NODE1, NODE2
      CHARACTER*1 SYM(MAXSYM), CH
      CHARACTER*256 INP
      INTEGER I, J
      INTEGER MIN1, MIN2, ROOT
      INTEGER CODLEN
      CHARACTER*256 CODE
      LOGICAL FOUND

      INTEGER LENTR
      EXTERNAL LENTR

      EXTERNAL ENCODE

C     Initialize arrays
      DO I = 1, MAXNOD
         FREQ(I) = 0
         LEFT(I) = 0
         RIGHT(I) = 0
         PARENT(I) = 0
      END DO

C     Get input string
      WRITE(*,*) 'Enter a phrase:'
      READ(*,'(A)') INP

C     Get length of input string without trailing spaces
      LEN = LENTR(INP)
      IF (LEN .EQ. 0) THEN
         WRITE(*,*) 'Empty input. Exiting.'
         STOP
      END IF

C     Count frequency of each unique symbol
      N = 0
      DO I = 1, LEN
         CH = INP(I:I)
         CHRCOD = ICHAR(CH)
         IF (CHRCOD .LT. 32 .OR. CHRCOD .GT. 126) GOTO 100
         FOUND = .FALSE.
         DO J = 1, N
            IF (CH .EQ. SYM(J)) THEN
               FOUND = .TRUE.
               FREQ(J) = FREQ(J) + 1
               GOTO 100
            END IF
         END DO
         N = N + 1
         SYM(N) = CH
         FREQ(N) = 1
  100 CONTINUE
      END DO
      IF (N .EQ. 0) THEN
         WRITE(*,*) 'No symbols to encode. Exiting.'
         STOP
      END IF

C     Build Huffman tree
      NDS = N
      DO WHILE (NDS .LT. 2 * N - 1)
         MIN1 = MAXINT
         MIN2 = MAXINT
         NODE1 = -1
         NODE2 = -1

C        Find two nodes with smallest frequencies
         DO I = 1, NDS
            IF (PARENT(I) .NE. 0) GOTO 200
            IF (FREQ(I) .LT. MIN1) THEN
               MIN2 = MIN1
               NODE2 = NODE1
               MIN1 = FREQ(I)
               NODE1 = I
            ELSE IF (FREQ(I) .LT. MIN2) THEN
               MIN2 = FREQ(I)
               NODE2 = I
            END IF
  200    CONTINUE
         END DO
         IF (NODE2 .EQ. -1) EXIT

C        Create a new parent node for the two smallest nodes
         NDS = NDS + 1
         FREQ(NDS) = FREQ(NODE1) + FREQ(NODE2)
         LEFT(NDS) = NODE1
         RIGHT(NDS) = NODE2
         PARENT(NODE1) = NDS
         PARENT(NODE2) = NDS
      END DO

      ROOT = NDS

C     Generate and display Huffman codes for each symbol
      WRITE(*,*) 'Huffman Codes:'
      DO I = 1, N
         CALL ENCODE(I, PARENT, LEFT, RIGHT, ROOT, CODE, CODLEN)
         WRITE(*,'(A1, A3, A)') SYM(I), ' -> ', CODE(1:CODLEN)
      END DO

      END

C**********************************************************************
C     _Function to compute length of string without trailing spaces
      INTEGER FUNCTION LENTR(STR)
      CHARACTER*(*) STR
      INTEGER J, CHRCOD
      LENTR = LEN(STR)
      DO J = LENTR, 1, -1
         CHRCOD = ICHAR(STR(J:J))
         IF (CHRCOD .NE. 10 .AND. CHRCOD .NE. 13 .AND.
     1       CHRCOD .NE. 32) THEN
            LENTR = J
            RETURN
         END IF
      END DO
      LENTR = 0
      END

C**********************************************************************
C     _Subroutine to generate Huffman code for a given symbol
      SUBROUTINE ENCODE(NODE, PARENT, LEFT, RIGHT, ROOT, CODE, LEN)
      INTEGER NODE
      INTEGER PARENT(*), LEFT(*), RIGHT(*), ROOT, LEN
      CHARACTER*256 CODE
      CHARACTER*1 PATH(256)
      INTEGER POS, CUR, I

C     Initialize variables
      POS = 0
      LEN = 0
      CODE = ''
      CUR = NODE

C     Trace path from node to root to generate the code
  300 CONTINUE
      IF (CUR .EQ. ROOT) GOTO 400
      POS = POS + 1
      IF (LEFT(PARENT(CUR)) .EQ. CUR) THEN
         PATH(POS) = '0'
      ELSE
         PATH(POS) = '1'
      END IF
      CUR = PARENT(CUR)
      GOTO 300
  400 CONTINUE

C     Reverse path to form the final code
      LEN = POS
      DO I = 1, POS
         CODE(I:I) = PATH(POS - I + 1)
      END DO
      RETURN
      END
