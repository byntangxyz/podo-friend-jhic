<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_profile_endpoints(): void
    {
        $this->putJson('/api/user/profile', ['name' => 'John', 'email' => 'john@test.com'])->assertStatus(401);
        $this->putJson('/api/user/password', ['current_password' => 'secret', 'new_password' => 'newsecret'])->assertStatus(401);
    }

    public function test_user_can_update_profile_name_and_email(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'email' => 'original@test.com',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/user/profile', [
                'name' => 'Updated Name',
                'email' => 'updated@test.com',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Profile updated successfully',
                'data' => [
                    'id' => $user->id,
                    'name' => 'Updated Name',
                    'email' => 'updated@test.com',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'email' => 'updated@test.com',
        ]);
    }

    public function test_user_can_keep_same_email_when_updating_name(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'email' => 'same@test.com',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/user/profile', [
                'name' => 'Only Name Changed',
                'email' => 'same@test.com',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Only Name Changed')
            ->assertJsonPath('data.email', 'same@test.com');
    }

    public function test_user_cannot_update_email_to_already_used_email(): void
    {
        $otherUser = User::factory()->create([
            'email' => 'existing@test.com',
        ]);

        $user = User::factory()->create([
            'email' => 'myemail@test.com',
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/user/profile', [
                'name' => 'My Name',
                'email' => 'existing@test.com',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_update_password_with_correct_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword123'),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/user/password', [
                'current_password' => 'oldpassword123',
                'new_password' => 'newpassword123',
                'new_password_confirmation' => 'newpassword123',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'message' => 'Password updated successfully',
            ]);

        $user->refresh();
        $this->assertTrue(Hash::check('newpassword123', $user->password));
    }

    public function test_user_cannot_update_password_with_incorrect_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword123'),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/user/password', [
                'current_password' => 'wrongpassword',
                'new_password' => 'newpassword123',
                'new_password_confirmation' => 'newpassword123',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);
    }

    public function test_user_cannot_update_password_if_confirmation_mismatches(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword123'),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/user/password', [
                'current_password' => 'oldpassword123',
                'new_password' => 'newpassword123',
                'new_password_confirmation' => 'mismatch123',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['new_password']);
    }

    public function test_user_cannot_update_password_with_less_than_8_chars(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword123'),
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->putJson('/api/user/password', [
                'current_password' => 'oldpassword123',
                'new_password' => 'short',
                'new_password_confirmation' => 'short',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['new_password']);
    }
}
