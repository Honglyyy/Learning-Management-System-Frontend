# Lesson 1.1: Spring IoC Container & REST APIs

```java
@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountDTO> createAccount(@Valid @RequestBody AccountCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.create(dto));
    }
}
```
