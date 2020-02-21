require 'awesome_print'
AwesomePrint.pry!

Pry.config.pager = false
Pry.config.prompt_name = "#{RUBY_VERSION}"
Pry.config.prompt = [
  proc { |target_self, nest_level, pry|
    "[#{pry.input_ring.size}] #{Pry.config.prompt_name} > "
  },

  proc { |target_self, nest_level, pry|
    "[#{pry.input_ring.size}] #{Pry.config.prompt_name} * "
  }
]

Pry.config.history.should_save = false
Pry.config.history.should_load = false
Pry.config.should_load_plugins = true