require 'pry-rescue'

module Kernel
  alias_method :orig_require, :require

  def require *args
    if args.first && args.first.start_with?('rspec') && orig_require('rspec/core')
      RSpec.configure do |config|
        config.color = true
        config.backtrace_exclusion_patterns << /gems/pry-rescue|gems/interception/
      end
    end

    orig_require *args
  end
end

module RSpec
  module Core
    class Runner
      def self.exit *args
      end
    end
  end
end

PryRescue.load 'Main.rb', true
print "\n"