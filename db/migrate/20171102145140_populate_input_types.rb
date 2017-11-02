def fetch_input_types
  functions = Dir.glob('app/javascript/packs/simulation/functions/*/*.js')
  input_types = {}

  functions.each do |func|
    content = File.read(func)
    function_name = func.split('/').pop.gsub('.js', '')
    function_input = content.scan(/input\:\s*\[([^\]]+)\],\s*definition/m)

    input_types[function_name] = {}

    if function_input.length > 0
      function_input = function_input[0][0].gsub("\n", '').strip
      inputs = ExecJS.exec('var Util = {}; var Constants = {}; return [' + function_input + ']')

      inputs.each do |input|
        input_types[function_name][input['name']] = input['type']
      end
    end
  end

  input_types
end

$input_types = fetch_input_types

def populate_input_types(value)
  if value != nil
    value = value.dup

    if value.kind_of?(Array)
      value.each_index { |i| value[i] = populate_input_types(value[i]) }
    elsif value['type'] == 'logical_operator'
      value['children'] = populate_input_types(value['children'])
    elsif value['type'] == 'function_call'
      value['input_types'] = $input_types[value['function']]
    end
  end

  value
end

class PopulateInputTypes < ActiveRecord::Migration[5.0]
  def change
    ActiveRecord::Base.transaction do
      Rule.order('id asc').each do |rule|
        puts "Updating rule #{rule.id}"
        rule.condition = populate_input_types(rule.condition)
        rule.action = populate_input_types(rule.action)
        rule.save!
      end

      Project.order('id asc').each do |project|
        puts "Updating project #{project.id}"
        project.stop_condition = populate_input_types(project.stop_condition)
        project.save!
      end
    end
  end
end
