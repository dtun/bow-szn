Pod::Spec.new do |s|
  s.name           = 'GameCenter'
  s.version        = '1.0.0'
  s.summary        = 'Game Center sign-in, score submission, and leaderboards for Bow Season'
  s.description    = 'Game Center sign-in, score submission, and leaderboards for Bow Season'
  s.author         = 'Bow Season'
  s.homepage       = 'https://paperstreetapp.com/bow-season'
  s.license        = { type: 'Proprietary' }
  s.platforms      = { :ios => '15.1' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'GameKit'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES'
  }

  s.source_files = '**/*.swift'
end
