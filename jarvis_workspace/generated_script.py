def is_palindrome(n):
    return str(n) == str(n)[::-1]

def main():
    num = int(input("Enter a number: "))
    if is_palindrome(num):
        print(num, "is a palindrome")
    else:
        print(num, "is not a palindrome")

if __name__ == "__main__":
    main()